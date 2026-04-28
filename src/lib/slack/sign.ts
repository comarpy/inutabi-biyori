import { createHmac, timingSafeEqual } from 'node:crypto';

export interface VerifyResult {
  ok: boolean;
  reason?: string;
  debug?: Record<string, unknown>;
}

// Slack Signing Secret によるリクエスト改ざん検証
// https://api.slack.com/authentication/verifying-requests-from-slack
export function verifySlackSignatureDetailed(args: {
  signingSecret: string;
  timestamp: string | null;
  body: string;
  signature: string | null;
}): VerifyResult {
  if (!args.signingSecret) {
    return { ok: false, reason: 'no_secret' };
  }
  if (!args.timestamp) {
    return { ok: false, reason: 'no_timestamp_header' };
  }
  if (!args.signature) {
    return { ok: false, reason: 'no_signature_header' };
  }

  const ts = parseInt(args.timestamp, 10);
  if (!Number.isFinite(ts)) {
    return { ok: false, reason: 'invalid_timestamp', debug: { timestamp: args.timestamp } };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > 60 * 5) {
    return { ok: false, reason: 'timestamp_too_old', debug: { ts, now, diff: now - ts } };
  }

  const base = `v0:${args.timestamp}:${args.body}`;
  const expected = `v0=${createHmac('sha256', args.signingSecret).update(base).digest('hex')}`;

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(args.signature);
    if (a.length !== b.length) {
      return {
        ok: false,
        reason: 'length_mismatch',
        debug: { expected_len: a.length, got_len: b.length },
      };
    }
    const matches = timingSafeEqual(a, b);
    return {
      ok: matches,
      reason: matches ? undefined : 'hmac_mismatch',
      debug: matches
        ? undefined
        : {
            secret_len: args.signingSecret.length,
            secret_prefix: args.signingSecret.slice(0, 4),
            body_len: args.body.length,
            body_preview: args.body.slice(0, 60),
            expected_prefix: expected.slice(0, 12),
            got_prefix: args.signature.slice(0, 12),
          },
    };
  } catch (e) {
    return { ok: false, reason: 'buffer_compare_threw', debug: { error: String(e) } };
  }
}

// 既存呼び出しとの互換のためのwrapper
export function verifySlackSignature(args: {
  signingSecret: string;
  timestamp: string | null;
  body: string;
  signature: string | null;
}): boolean {
  return verifySlackSignatureDetailed(args).ok;
}
