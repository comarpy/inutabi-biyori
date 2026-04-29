// Slack通知ヘルパー。env未設定なら no-op で動く（ローカル開発用）
// env変数はモジュール読込時ではなく関数呼び出し時に読む（dotenvの読込順問題を回避）
function getEnv() {
  return {
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_DISCOVERY_CHANNEL,
  };
}

export function isSlackConfigured(): boolean {
  const { token, channel } = getEnv();
  return !!(token && channel);
}

type Block = Record<string, unknown>;

interface PostMessageArgs {
  text: string;
  blocks?: Block[];
  threadTs?: string;
  channel?: string;
}

interface PostMessageResponse {
  ok: boolean;
  ts?: string;
  channel?: string;
  error?: string;
}

export async function postSlackMessage(args: PostMessageArgs): Promise<PostMessageResponse | null> {
  if (!isSlackConfigured()) {
    console.log('💬 [Slack未設定] スキップ:', args.text.slice(0, 80));
    return null;
  }

  const { token, channel: defaultChannel } = getEnv();
  const channel = args.channel ?? defaultChannel!;
  const body: Record<string, unknown> = {
    channel,
    text: args.text,
  };
  if (args.blocks) body.blocks = args.blocks;
  if (args.threadTs) body.thread_ts = args.threadTs;

  // レート制限時の自動リトライ（最大5回、Retry-After ヘッダ尊重）
  const MAX_RETRIES = 5;
  let lastError = '';
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    // 429 はステータスコード経由で来る場合と body の error 経由で来る場合がある
    const isRateLimited = res.status === 429;
    let json: PostMessageResponse | null = null;
    try { json = (await res.json()) as PostMessageResponse; } catch {}

    const rateLimitedByBody = json?.ok === false && json?.error === 'ratelimited';

    if (isRateLimited || rateLimitedByBody) {
      const retryAfterHeader = res.headers.get('retry-after');
      const waitSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 2 ** attempt; // 1, 2, 4, 8, 16秒
      console.warn(`⏳ rate limited (attempt ${attempt + 1}/${MAX_RETRIES}) — ${waitSec}秒待機`);
      await new Promise((r) => setTimeout(r, (waitSec + 1) * 1000));
      lastError = 'ratelimited';
      continue;
    }

    if (!json?.ok) {
      console.error('❌ Slack送信エラー:', json?.error ?? 'unknown');
      return json;
    }
    return json;
  }

  console.error(`❌ Slack送信エラー: ${MAX_RETRIES}回リトライしても失敗 (${lastError})`);
  return { ok: false, error: lastError };
}

// 既存メッセージの本文を書き換える（ロールバック等で利用）
export async function chatUpdate(args: {
  channel: string;
  ts: string;
  text: string;
  blocks?: Block[];
}): Promise<PostMessageResponse | null> {
  const { token } = getEnv();
  if (!token) return null;
  const res = await fetch('https://slack.com/api/chat.update', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(args),
  });
  const json = (await res.json()) as PostMessageResponse;
  if (!json.ok) console.error('❌ Slack chat.update エラー:', json.error);
  return json;
}

// ホテル候補1件あたりのBlock Kitメッセージを構築
export function buildCandidateBlocks(args: {
  name: string;
  address: string;
  source: string;
  sourceUrl?: string;
  queueId: string;
}): Block[] {
  const fields: Block[] = [
    { type: 'mrkdwn', text: `*${args.name}*` },
    { type: 'mrkdwn', text: `📍 ${args.address}` },
    { type: 'mrkdwn', text: `🔗 出典: ${args.source}` },
  ];

  return [
    {
      type: 'section',
      fields,
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ 追加', emoji: true },
          style: 'primary',
          value: args.queueId,
          action_id: 'approve_candidate',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '❌ 却下', emoji: true },
          style: 'danger',
          value: args.queueId,
          action_id: 'reject_candidate',
        },
        ...(args.sourceUrl
          ? [
              {
                type: 'button',
                text: { type: 'plain_text', text: '🔍 出典を見る', emoji: true },
                url: args.sourceUrl,
                action_id: 'view_source',
              },
            ]
          : []),
      ],
    },
  ];
}
