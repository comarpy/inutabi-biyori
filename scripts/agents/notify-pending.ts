/**
 * discovery_queue の pending 候補を Slack に通知する単発ジョブ
 *
 *   npx tsx scripts/agents/notify-pending.ts
 *
 * Slack 設定が無い場合は no-op で終了
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { isSlackConfigured, postSlackMessage, buildCandidateBlocks } from './lib/slack';

loadEnv({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  if (!isSlackConfigured()) {
    console.error('❌ SLACK_BOT_TOKEN / SLACK_DISCOVERY_CHANNEL が未設定');
    process.exit(1);
  }

  // pending かつ slack_message_ts が空のものを取得
  const { data, error } = await sb
    .from('discovery_queue')
    .select('id, candidate_name, candidate_address, raw_payload, discovered_from')
    .eq('status', 'pending')
    .is('slack_message_ts', null)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ クエリ失敗:', error);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log('✨ 通知すべきpending候補なし');
    return;
  }

  console.log(`📬 ${data.length}件の候補を通知...`);

  // 集約ヘッダー
  const header = await postSlackMessage({
    text: `🐕 未通知のpending候補 ${data.length}件`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `🐕 pending候補 ${data.length}件`, emoji: true },
      },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: 'スレッド内の各候補の「✅追加」「⏭️スキップ」ボタンで処理してください。' },
        ],
      },
    ],
  });
  const threadTs = header?.ts;

  // 各候補
  for (const row of data) {
    const payload = row.raw_payload as Record<string, unknown> | null;
    const sourceUrl =
      (payload?.hotelInformationUrl as string | undefined) ||
      (payload?.planListUrl as string | undefined);

    const sourceLabel = row.discovered_from === 'rakuten_keyword' ? '楽天トラベル' : row.discovered_from || '不明';

    const sent = await postSlackMessage({
      text: row.candidate_name,
      threadTs,
      blocks: buildCandidateBlocks({
        name: row.candidate_name,
        address: row.candidate_address || '',
        source: sourceLabel,
        sourceUrl,
        queueId: row.id,
      }),
    });

    if (sent?.ok && sent.ts) {
      // 二重通知防止のため slack_message_ts を保存
      await sb
        .from('discovery_queue')
        .update({ slack_message_ts: sent.ts })
        .eq('id', row.id);
    }

    // Slack rate limit 対策（Tier3 = 50req/min ＝ 約0.83/秒）
    await new Promise((r) => setTimeout(r, 1100));
  }

  console.log('🏁 完了');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
