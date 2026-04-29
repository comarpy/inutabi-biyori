/**
 * discovery_queue で status='approved' になっている候補を hotels に昇格させる
 *
 *   npx tsx scripts/agents/promote-approved.ts            # dry-run
 *   npx tsx scripts/agents/promote-approved.ts --apply    # 実行
 *
 * 処理:
 *   1. queue から approved を全件取得
 *   2. それぞれが既存 hotels に同じ宿として存在するかチェック（addr+phone）
 *      - 存在: queue.status='merged' に更新（hotelsには追加しない）
 *      - 存在しない: hotels + hotel_sources + hotel_revisions を作成、queue.status='merged'
 *   3. 都道府県マスタから prefecture_id を解決
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { extractPrefecture } from './lib/dedup';

loadEnv({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

const sb = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

interface RakutenPayload {
  hotelNo?: string;
  hotelName?: string;
  address1?: string;
  address2?: string;
  telephoneNo?: string;
  hotelImageUrl?: string;
  hotelInformationUrl?: string;
  planListUrl?: string;
  hotelComment?: string;
  reviewAverage?: number;
  reviewCount?: number;
}

interface QueueRow {
  id: string;
  candidate_name: string;
  candidate_address: string | null;
  raw_payload: RakutenPayload | null;
  dedup_hash: string | null;
  address_dedup_hash: string | null;
  phone_dedup_hash: string | null;
  decided_by: string | null;
  decided_at: string | null;
}

function mapHotelType(name: string, comment: string): string {
  const text = `${name} ${comment}`.toLowerCase();
  if (text.includes('ペンション')) return 'pension';
  if (text.includes('旅館')) return 'ryokan';
  if (text.includes('コテージ') || text.includes('貸別荘') || text.includes('一棟')) return 'cottage';
  if (text.includes('グランピング')) return 'glamping';
  if (text.includes('民宿')) return 'minshuku';
  if (text.includes('リゾート')) return 'resort';
  if (text.includes('ホテル') || text.toLowerCase().includes('hotel')) return 'hotel';
  return 'other';
}

async function main() {
  console.log(APPLY ? '🚀 APPLYモード' : '🔍 DRY-RUNモード（--apply で実反映）');

  // 1. approved を取得
  const { data: approved } = await sb
    .from('discovery_queue')
    .select('id, candidate_name, candidate_address, raw_payload, dedup_hash, address_dedup_hash, phone_dedup_hash, decided_by, decided_at')
    .eq('status', 'approved');

  if (!approved || approved.length === 0) {
    console.log('approved なし');
    return;
  }
  console.log(`📦 対象: ${approved.length}件`);

  // 2. 都道府県マスタ
  const { data: prefs } = await sb.from('prefectures').select('id, name');
  const prefByName = new Map((prefs ?? []).map((p: any) => [p.name, p.id]));

  // 3. 既存hotelsの (address_hash, phone_hash) インデックス
  const existingMatches = new Map<string, string>(); // composite key → hotel_id
  const PAGE = 1000;
  for (let off = 0; ; off += PAGE) {
    const r = await sb
      .from('hotels')
      .select('id, address_dedup_hash, phone_dedup_hash')
      .range(off, off + PAGE - 1);
    if (!r.data || r.data.length === 0) break;
    for (const h of r.data) {
      if (h.address_dedup_hash && h.phone_dedup_hash) {
        existingMatches.set(`${h.address_dedup_hash}|${h.phone_dedup_hash}`, h.id);
      }
    }
    if (r.data.length < PAGE) break;
  }

  const stats = { merged_only: 0, created: 0, error: 0, no_pref: 0 };

  for (const row of approved as QueueRow[]) {
    const payload = row.raw_payload ?? {};

    // (a) 既存マッチ判定
    const compositeKey = row.address_dedup_hash && row.phone_dedup_hash
      ? `${row.address_dedup_hash}|${row.phone_dedup_hash}`
      : null;
    const existingHotelId = compositeKey ? existingMatches.get(compositeKey) : undefined;

    if (existingHotelId) {
      // 既存と同じ宿 → 新規作成せずに queue を merged に
      if (APPLY) {
        await sb
          .from('discovery_queue')
          .update({ status: 'merged', resolved_hotel_id: existingHotelId, resolved_at: new Date().toISOString() })
          .eq('id', row.id);
      }
      console.log(`⏭  既存マッチ: ${row.candidate_name} → existing ${existingHotelId}`);
      stats.merged_only++;
      continue;
    }

    // (b) 新規作成
    const prefName = extractPrefecture(row.candidate_address ?? '');
    const prefId = prefName ? prefByName.get(prefName) : null;
    if (!prefId) {
      console.warn(`⚠️  都道府県不明: ${row.candidate_name} (addr=${row.candidate_address})`);
      stats.no_pref++;
      continue;
    }

    const fullAddress = row.candidate_address ?? '';
    const phone = payload.telephoneNo || null;
    const description = (payload.hotelComment || '').slice(0, 1000);
    const websiteUrl = payload.hotelInformationUrl || payload.planListUrl || null;
    const slug = `rakuten-${payload.hotelNo ?? row.id.slice(0, 8)}`;
    const hotelType = mapHotelType(row.candidate_name, description);

    if (!APPLY) {
      console.log(`📝 [DRY] 新規作成: ${row.candidate_name} (${prefName}, ${hotelType}, slug=${slug})`);
      stats.created++;
      continue;
    }

    try {
      // hotels INSERT
      const { data: inserted, error: e1 } = await sb
        .from('hotels')
        .insert({
          prefecture_id: prefId,
          name: row.candidate_name,
          slug,
          description: description || null,
          address: fullAddress,
          phone,
          website_url: websiteUrl,
          hotel_type: hotelType,
          status: 'published',
          dedup_hash: row.dedup_hash,
          address_dedup_hash: row.address_dedup_hash,
          phone_dedup_hash: row.phone_dedup_hash,
        })
        .select('id')
        .single();

      if (e1 || !inserted) throw e1 ?? new Error('insert hotels failed');
      const hotelId = inserted.id;

      // hotel_dog_policies (デフォルト：犬OK の事実だけ。詳細不明)
      await sb.from('hotel_dog_policies').insert({
        hotel_id: hotelId,
        accepted_sizes: ['small', 'medium', 'large'], // 楽天の犬OK検索結果なので一旦全サイズ
        max_dogs: 1,
        notes: 'Rakuten APIから自動登録。詳細はサイト側で随時更新',
      });

      // メイン画像（楽天画像URL）
      if (payload.hotelImageUrl) {
        await sb.from('hotel_images').insert({
          hotel_id: hotelId,
          storage_path: payload.hotelImageUrl,
          is_main: true,
          sort_order: 0,
        });
      }

      // hotel_sources
      await sb.from('hotel_sources').insert({
        hotel_id: hotelId,
        source_type: 'rakuten',
        source_id: payload.hotelNo,
        source_url: payload.hotelInformationUrl || null,
        affiliate_url: payload.planListUrl || null,
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: 'ok',
      });

      // booking_links（楽天アフィリエイト）
      if (payload.planListUrl) {
        await sb.from('booking_links').insert({
          hotel_id: hotelId,
          provider: 'rakuten',
          affiliate_url: payload.planListUrl,
          is_active: true,
        });
      }

      // hotel_revisions（変更履歴）
      await sb.from('hotel_revisions').insert({
        hotel_id: hotelId,
        changed_by: row.decided_by ?? 'agent_b',
        change_type: 'create',
        diff: {
          source: 'queue_promotion',
          queue_id: row.id,
          decided_at: row.decided_at,
        },
      });

      // queue を merged に
      await sb
        .from('discovery_queue')
        .update({ status: 'merged', resolved_hotel_id: hotelId, resolved_at: new Date().toISOString() })
        .eq('id', row.id);

      console.log(`✅ ${row.candidate_name} → hotel.id=${hotelId}`);
      stats.created++;
    } catch (err) {
      console.error(`❌ ${row.candidate_name}:`, err);
      stats.error++;
    }
  }

  console.log('---');
  console.log(`📊 結果: ${JSON.stringify(stats)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
