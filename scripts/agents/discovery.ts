/**
 * エージェントA — 週次の新規犬OK宿ディスカバリー
 *
 * 使い方:
 *   npx tsx scripts/agents/discovery.ts                # dry-run（DBに書かない）
 *   npx tsx scripts/agents/discovery.ts --apply        # 実際にdiscovery_queueへINSERT
 *
 * フロー:
 *   1. 楽天 KeywordHotelSearch で犬関連キーワードを順番に検索
 *   2. dedup_hashを計算
 *   3. 既存 hotels / discovery_queue と突合してフィルタ
 *   4. 残りを discovery_queue に INSERT (status=pending)
 *   5. Slack に集約通知 + 各候補のBlock Kit
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeDedupHash } from './lib/dedup';
import { isSlackConfigured, postSlackMessage, buildCandidateBlocks } from './lib/slack';

loadEnv({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const LIMIT_PER_KEYWORD = 30;

// 楽天KeywordHotelSearch（src/lib/rakuten.ts内のものはhits=5固定なので、ここでは独自実装）
// KeywordHotelSearch は最低2文字以上の keyword を要求する
const KEYWORDS = [
  // 旧5語
  '犬OK', 'ペット可', '愛犬', 'わんこ', 'ドッグラン',
  // 拡張15語
  'ペット同伴', '犬連れ', 'ペット連れ', '犬と泊まる', 'ワンちゃん',
  'ペットフレンドリー', 'ペット歓迎', 'わんちゃん', 'いぬ', '愛犬と泊まる',
  'ペット温泉', '犬温泉', 'ドッグフレンドリー', 'ペット用', 'ペット宿',
];

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RAKUTEN_APP_ID = process.env.RAKUTEN_APPLICATION_ID;
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が未設定');
  process.exit(1);
}
if (!RAKUTEN_APP_ID) {
  console.error('❌ RAKUTEN_APPLICATION_ID が未設定');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------
// 楽天キーワード検索（hits=30で取得）
// ---------------------------------------------------------------
interface RakutenHit {
  hotelNo: string;
  hotelName: string;
  address1: string;
  address2: string;
  telephoneNo: string;
  hotelImageUrl: string;
  hotelInformationUrl: string;
  planListUrl: string;
  reviewAverage: number;
  reviewCount: number;
  hotelComment: string;
}

async function searchKeyword(keyword: string): Promise<RakutenHit[]> {
  const params = new URLSearchParams({
    applicationId: RAKUTEN_APP_ID!,
    format: 'json',
    keyword,
    hits: String(LIMIT_PER_KEYWORD),
  });
  if (RAKUTEN_AFFILIATE_ID) params.append('affiliateId', RAKUTEN_AFFILIATE_ID);

  const url = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?${params}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.error) {
      console.warn(`⚠️  ${keyword}: ${json.error}`);
      return [];
    }
    const hits: RakutenHit[] = [];
    for (const wrapper of json.hotels ?? []) {
      const info = wrapper?.hotel?.[0]?.hotelBasicInfo;
      if (!info?.hotelNo || !info?.hotelName) continue;
      hits.push({
        hotelNo: String(info.hotelNo),
        hotelName: info.hotelName,
        address1: info.address1 ?? '',
        address2: info.address2 ?? '',
        telephoneNo: info.telephoneNo ?? '',
        hotelImageUrl: info.hotelImageUrl ?? '',
        hotelInformationUrl: info.hotelInformationUrl ?? '',
        planListUrl: info.planListUrl ?? '',
        reviewAverage: info.reviewAverage ?? 0,
        reviewCount: info.reviewCount ?? 0,
        hotelComment: info.hotelComment ?? '',
      });
    }
    return hits;
  } catch (e) {
    console.warn(`⚠️  ${keyword} 例外:`, e);
    return [];
  }
}

// 楽天のhotelNoが既に hotel_sources に登録されているか
async function knownRakutenHotelNos(): Promise<Set<string>> {
  const set = new Set<string>();
  const PAGE = 1000;
  for (let off = 0; ; off += PAGE) {
    const { data, error } = await sb
      .from('hotel_sources')
      .select('source_id')
      .eq('source_type', 'rakuten')
      .range(off, off + PAGE - 1);
    if (error || !data || data.length === 0) break;
    for (const r of data) if (r.source_id) set.add(String(r.source_id));
    if (data.length < PAGE) break;
  }
  return set;
}

// ---------------------------------------------------------------
// メイン
// ---------------------------------------------------------------
async function main() {
  const startedAt = new Date();
  console.log(APPLY ? '🚀 APPLYモード' : '🔍 DRY-RUNモード（--apply で実投入）');

  // agent_runs に記録（apply時のみ）
  let runId: number | null = null;
  if (APPLY) {
    const { data } = await sb
      .from('agent_runs')
      .insert({
        agent_name: 'agent_a',
        trigger_type: 'manual',
        status: 'running',
      })
      .select('id')
      .single();
    runId = (data as { id: number } | null)?.id ?? null;
  }

  // 1. 楽天検索を順次実行（並列だとAPIレート上限に引っかかる）
  console.log(`📡 楽天検索: ${KEYWORDS.join(', ')}`);
  const allHits = new Map<string, RakutenHit>();
  for (const kw of KEYWORDS) {
    const hits = await searchKeyword(kw);
    console.log(`   ${kw}: ${hits.length}件`);
    for (const h of hits) {
      if (!allHits.has(h.hotelNo)) allHits.set(h.hotelNo, h);
    }
    // rate-limit対策で1秒待つ
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(`📦 ユニーク候補: ${allHits.size}件`);

  // 2. 既存rakutenソースID取得
  const knownRakutenNos = await knownRakutenHotelNos();
  console.log(`📋 既存rakutenソース: ${knownRakutenNos.size}件`);

  // 3. 既存 dedup_hash を取得（hotels + discovery_queue両方）
  const knownHashes = new Set<string>();
  {
    const PAGE = 1000;
    for (let off = 0; ; off += PAGE) {
      const { data, error } = await sb.from('hotels').select('dedup_hash').range(off, off + PAGE - 1);
      if (error || !data || data.length === 0) break;
      for (const r of data) if (r.dedup_hash) knownHashes.add(r.dedup_hash);
      if (data.length < PAGE) break;
    }
    const { data: q } = await sb.from('discovery_queue').select('dedup_hash');
    for (const r of q ?? []) if (r.dedup_hash) knownHashes.add(r.dedup_hash);
  }
  console.log(`📋 既存dedup_hash: ${knownHashes.size}件`);

  // 4. 候補をフィルタ
  const newCandidates: Array<{
    hit: RakutenHit;
    hash: string;
    fullAddress: string;
  }> = [];

  const stats = { dup_hash: 0, dup_rakuten_no: 0, fresh: 0 };
  for (const hit of allHits.values()) {
    const fullAddress = `${hit.address1}${hit.address2}`.trim();
    if (knownRakutenNos.has(hit.hotelNo)) {
      stats.dup_rakuten_no++;
      continue;
    }
    const hash = computeDedupHash({
      name: hit.hotelName,
      address: fullAddress,
      phone: hit.telephoneNo,
    });
    if (knownHashes.has(hash)) {
      stats.dup_hash++;
      continue;
    }
    knownHashes.add(hash); // バッチ内重複も防ぐ
    newCandidates.push({ hit, hash, fullAddress });
    stats.fresh++;
  }

  console.log('---');
  console.log(`🆕 新規候補: ${stats.fresh}件 / 重複(hash): ${stats.dup_hash}件 / 重複(rakuten_no): ${stats.dup_rakuten_no}件`);

  // 5. discovery_queue へINSERT
  if (newCandidates.length === 0) {
    console.log('✨ 新規候補なし — 今週はクリーン');
  } else if (!APPLY) {
    console.log('---');
    console.log('📝 新規候補プレビュー:');
    for (const c of newCandidates.slice(0, 10)) {
      console.log(`   - ${c.hit.hotelName} / ${c.fullAddress}`);
    }
    if (newCandidates.length > 10) {
      console.log(`   ...他 ${newCandidates.length - 10}件`);
    }
  } else {
    console.log('---');
    console.log('💾 discovery_queueへINSERT中...');
    const insertRows = newCandidates.map((c) => ({
      dedup_hash: c.hash,
      candidate_name: c.hit.hotelName,
      candidate_address: c.fullAddress.slice(0, 300),
      raw_payload: c.hit as unknown as Record<string, unknown>,
      discovered_by: 'agent_a',
      discovered_from: 'rakuten_keyword',
    }));
    const { data: inserted, error } = await sb
      .from('discovery_queue')
      .insert(insertRows)
      .select('id, candidate_name, candidate_address');
    if (error) {
      console.error('❌ INSERT失敗:', error);
    } else {
      console.log(`✅ ${inserted?.length ?? 0}件 INSERT完了`);
    }

    // 6. Slack通知
    if (isSlackConfigured()) {
      console.log('💬 Slack通知中...');
      // ヘッダー
      const header = await postSlackMessage({
        text: `🐕 今週の新規犬OK宿候補: ${newCandidates.length}件`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: `🐕 今週の新規候補 ${newCandidates.length}件`, emoji: true },
          },
          {
            type: 'context',
            elements: [
              { type: 'mrkdwn', text: `集計: 🆕 ${stats.fresh} / 重複 ${stats.dup_hash + stats.dup_rakuten_no} / 走査 ${allHits.size}` },
            ],
          },
        ],
      });
      const threadTs = header?.ts;

      // 各候補をスレッドにぶら下げ
      // - Slack chat.postMessage の rate limit は Tier3 = 50 req/min なので 1.1s 間隔
      // - 成功したらDBに slack_message_ts を保存（後追い再送/更新で利用）
      const queueRows = inserted ?? [];
      for (let i = 0; i < newCandidates.length; i++) {
        const c = newCandidates[i];
        const queueId = queueRows[i]?.id;
        if (!queueId) continue;
        const sent = await postSlackMessage({
          text: c.hit.hotelName,
          threadTs,
          blocks: buildCandidateBlocks({
            name: c.hit.hotelName,
            address: c.fullAddress,
            source: '楽天トラベル',
            sourceUrl: c.hit.hotelInformationUrl || c.hit.planListUrl,
            queueId,
          }),
        });
        if (sent?.ok && sent.ts) {
          await sb.from('discovery_queue').update({ slack_message_ts: sent.ts }).eq('id', queueId);
        }
        await new Promise((r) => setTimeout(r, 1100));
      }
    } else {
      console.log('💬 Slack未設定のため通知スキップ');
    }
  }

  // 7. agent_runs を完了でクローズ
  if (APPLY && runId !== null) {
    await sb
      .from('agent_runs')
      .update({
        finished_at: new Date().toISOString(),
        status: 'success',
        stats: { ...stats, total_candidates: allHits.size, duration_ms: Date.now() - startedAt.getTime() },
      })
      .eq('id', runId);
  }

  console.log('---');
  console.log('🏁 完了');
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
