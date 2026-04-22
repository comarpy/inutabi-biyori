// 軽量なインメモリ レート制限
// 注意: サーバーレス環境ではインスタンスごとに状態が独立するため、
// 本番運用時は Upstash Redis などの外部ストアへの置き換えを推奨。
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  limit: number;         // 時間窓内に許可するリクエスト数
  windowMs: number;      // 時間窓（ミリ秒）
  key: string;           // バケットキー（例: IPアドレス + ルート）
}

export function rateLimit(options: RateLimitOptions): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(options.key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  if (bucket.count >= options.limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real;
  return 'unknown';
}
