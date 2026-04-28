import { createHmac, timingSafeEqual } from 'node:crypto';

// Slack Signing Secret によるリクエスト改ざん検証
// https://api.slack.com/authentication/verifying-requests-from-slack
export function verifySlackSignature(args: {
  signingSecret: string;
  timestamp: string | null;
  body: string;
  signature: string | null;
}): boolean {
  if (!args.timestamp || !args.signature) return false;

  const ts = parseInt(args.timestamp, 10);
  if (!Number.isFinite(ts)) return false;

  // 5分以上前のリクエストはリプレイ攻撃の可能性として拒否
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 60 * 5) return false;

  const base = `v0:${args.timestamp}:${args.body}`;
  const expected = `v0=${createHmac('sha256', args.signingSecret).update(base).digest('hex')}`;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(args.signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
