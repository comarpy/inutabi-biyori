// Slack Web API ラッパー（API Routes・Server Components から使う想定）
const SLACK_API_BASE = 'https://slack.com/api';

interface SlackResponse {
  ok: boolean;
  error?: string;
  ts?: string;
  channel?: string;
  [key: string]: unknown;
}

function getToken(): string {
  const t = process.env.SLACK_BOT_TOKEN;
  if (!t) throw new Error('SLACK_BOT_TOKEN is not set');
  return t;
}

async function call(method: string, body: Record<string, unknown>): Promise<SlackResponse> {
  const res = await fetch(`${SLACK_API_BASE}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as SlackResponse;
  if (!json.ok) {
    console.error(`[slack/api] ${method} failed:`, JSON.stringify({
      error: json.error,
      response_metadata: json.response_metadata,
      needed: (json as { needed?: string }).needed,
      provided: (json as { provided?: string }).provided,
    }));
  }
  return json;
}

export async function viewsOpen(triggerId: string, view: object): Promise<SlackResponse> {
  return call('views.open', { trigger_id: triggerId, view });
}

export async function chatPostMessage(args: {
  channel: string;
  text: string;
  thread_ts?: string;
  blocks?: object[];
}): Promise<SlackResponse> {
  return call('chat.postMessage', args);
}

export async function chatUpdate(args: {
  channel: string;
  ts: string;
  text: string;
  blocks?: object[];
}): Promise<SlackResponse> {
  return call('chat.update', args);
}
