/**
 * テスト用：1件だけ button付きメッセージをSlackに送る
 *   npx tsx scripts/agents/send-test-button.ts
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { postSlackMessage } from './lib/slack';

loadEnv({ path: '.env.local' });

async function main() {
  const res = await postSlackMessage({
    text: 'Phase 1 動作確認テスト',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🔧 Interactivity動作確認テスト*\n下のボタンを押すとVercelに通知が飛びます。',
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ テスト承認', emoji: true },
            style: 'primary',
            value: 'TEST_APPROVE',
            action_id: 'approve_candidate',
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '❌ テスト却下', emoji: true },
            style: 'danger',
            value: 'TEST_REJECT',
            action_id: 'reject_candidate',
          },
        ],
      },
    ],
  });
  console.log('送信結果:', res);
}

main().catch((e) => { console.error(e); process.exit(1); });
