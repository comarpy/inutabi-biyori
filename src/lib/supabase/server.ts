import { createClient } from '@supabase/supabase-js';

// service_role クライアント
// ★ RLSをバイパスする。NEXT_PUBLIC_ で公開しないこと。
// API Routes、エージェント、移行スクリプトからのみ使用する。
export function createServerClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'createServerClient: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
