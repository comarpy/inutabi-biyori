/**
 * 直近の判断（承認/却下）を巻き戻す
 *   npx tsx scripts/agents/rollback-decisions.ts            # dry-run
 *   npx tsx scripts/agents/rollback-decisions.ts --apply    # 実反映
 *   npx tsx scripts/agents/rollback-decisions.ts --apply --since-minutes 60
 *
 * - DBの decided_at / decided_by / rejection_* / status を null に戻す
 * - Slackのメッセージを元のボタン付きカードに書き戻す
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { chatUpdate, buildCandidateBlocks } from './lib/slack';

loadEnv({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const sinceIdx = process.argv.indexOf('--since-minutes');
const SINCE_MIN = sinceIdx >= 0 ? parseInt(process.argv[sinceIdx + 1] ?? '60', 10) : 60;

const sb = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const SLACK_CHANNEL = process.env.SLACK_DISCOVERY_CHANNEL!;

async function main() {
  console.log(APPLY ? `🚀 APPLYモード（過去 ${SINCE_MIN} 分の判断を巻き戻す）` : `🔍 DRY-RUNモード`);
  const since = new Date(Date.now() - SINCE_MIN * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from('discovery_queue')
    .select('id, candidate_name, candidate_address, raw_payload, slack_message_ts, status, decided_by, decided_at')
    .gte('decided_at', since)
    .order('decided_at', { ascending: false });

  if (error) {
    console.error('❌ クエリ失敗:', error);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log(`✨ 過去 ${SINCE_MIN} 分以内の判断はありません`);
    return;
  }

  console.log(`📋 対象: ${data.length} 件`);
  for (const row of data) {
    console.log(`   - ${row.status === 'approved' ? '✅' : '❌'} ${row.candidate_name} (by ${row.decided_by})`);
  }

  if (!APPLY) {
    console.log('\n--apply で実反映します');
    return;
  }

  for (const row of data as Array<{
    id: string;
    candidate_name: string;
    candidate_address: string | null;
    raw_payload: Record<string, unknown> | null;
    slack_message_ts: string | null;
  }>) {
    // 1. Slackメッセージを元のボタン付きカードに戻す
    if (row.slack_message_ts && SLACK_CHANNEL) {
      const sourceUrl =
        (row.raw_payload?.hotelInformationUrl as string | undefined) ||
        (row.raw_payload?.planListUrl as string | undefined);
      const blocks = buildCandidateBlocks({
        name: row.candidate_name,
        address: row.candidate_address ?? '',
        source: '楽天トラベル',
        sourceUrl,
        queueId: row.id,
      });
      await chatUpdate({
        channel: SLACK_CHANNEL,
        ts: row.slack_message_ts,
        text: row.candidate_name,
        blocks,
      });
      // Slack chat.update もrate limit対象なので少し待つ
      await new Promise((r) => setTimeout(r, 1100));
    }

    // 2. DBを pending に戻す
    const { error: updateErr } = await sb
      .from('discovery_queue')
      .update({
        status: 'pending',
        rejection_category: null,
        rejection_reason: null,
        decided_by: null,
        decided_at: null,
      })
      .eq('id', row.id);
    if (updateErr) {
      console.error(`❌ ${row.candidate_name} の reset 失敗:`, updateErr.message);
    } else {
      console.log(`✅ ${row.candidate_name} 巻き戻し完了`);
    }
  }

  console.log('🏁 完了');
}

main().catch((e) => { console.error(e); process.exit(1); });
