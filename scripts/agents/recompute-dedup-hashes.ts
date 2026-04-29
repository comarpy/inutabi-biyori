/**
 * 既存hotels.dedup_hash を新しい正規化で再計算する
 *   npx tsx scripts/agents/recompute-dedup-hashes.ts            # dry-run
 *   npx tsx scripts/agents/recompute-dedup-hashes.ts --apply    # UPDATE実行
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeDedupHash } from './lib/dedup';

loadEnv({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const sb = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

interface HotelRow {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  dedup_hash: string | null;
}

async function fetchAll(): Promise<HotelRow[]> {
  const PAGE = 1000;
  const all: HotelRow[] = [];
  for (let off = 0; ; off += PAGE) {
    const { data, error } = await sb
      .from('hotels')
      .select('id, name, address, phone, dedup_hash')
      .range(off, off + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as HotelRow[]));
    if (data.length < PAGE) break;
  }
  return all;
}

async function main() {
  console.log(APPLY ? '🚀 APPLYモード' : '🔍 DRY-RUNモード（--apply で実反映）');

  const hotels = await fetchAll();
  console.log(`📦 対象: ${hotels.length}件`);

  let changed = 0;
  let unchanged = 0;
  const newHashSeen = new Map<string, string>(); // hash → hotelId 重複検出用
  const collisions: Array<{ id: string; name: string; collidesWith: string }> = [];

  const updates: Array<{ id: string; newHash: string }> = [];
  for (const h of hotels) {
    const newHash = computeDedupHash({
      name: h.name,
      address: h.address,
      phone: h.phone,
    });
    if (newHashSeen.has(newHash)) {
      collisions.push({ id: h.id, name: h.name, collidesWith: newHashSeen.get(newHash)! });
    } else {
      newHashSeen.set(newHash, h.id);
    }
    if (newHash !== h.dedup_hash) {
      updates.push({ id: h.id, newHash });
      changed++;
    } else {
      unchanged++;
    }
  }

  console.log(`📊 変更あり: ${changed}件 / 変更なし: ${unchanged}件`);
  console.log(`🔄 ハッシュ衝突（同じ宿として認識されるペア）: ${collisions.length}件`);

  if (collisions.length > 0) {
    console.log('\n衝突例（先頭10件）:');
    for (const c of collisions.slice(0, 10)) {
      const partner = hotels.find((x) => x.id === c.collidesWith);
      console.log(`  - "${c.name}" vs "${partner?.name}"`);
    }
  }

  if (!APPLY) {
    console.log('\n--apply で実反映します');
    return;
  }

  // 衝突がある場合は片方を archived にして UNIQUE 制約を回避
  // (今回は同じ宿のはずなので、後から見つけたほうを archived)
  if (collisions.length > 0) {
    console.log(`\n🗑️  衝突 ${collisions.length}件を archived 化します（後から検出したほう）`);
    for (const c of collisions) {
      await sb.from('hotels').update({ status: 'archived', dedup_hash: null }).eq('id', c.id);
    }
  }

  // バッチ UPDATE（1件ずつ。Supabase上限を考慮）
  console.log(`\n🔄 ${updates.length}件のhash更新中...`);
  let done = 0;
  for (const u of updates) {
    if (collisions.find((c) => c.id === u.id)) continue; // archived済みはスキップ
    const { error } = await sb.from('hotels').update({ dedup_hash: u.newHash }).eq('id', u.id);
    if (error) {
      console.error(`❌ ${u.id}:`, error.message);
    } else {
      done++;
      if (done % 500 === 0) console.log(`   ${done}/${updates.length}件...`);
    }
  }

  console.log(`\n✅ ${done}件更新完了`);
}

main().catch((e) => { console.error(e); process.exit(1); });
