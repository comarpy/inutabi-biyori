/**
 * 既存hotels の dedup_hash / address_dedup_hash / phone_dedup_hash を再計算
 *   npx tsx scripts/agents/recompute-dedup-hashes.ts            # dry-run
 *   npx tsx scripts/agents/recompute-dedup-hashes.ts --apply    # UPDATE実行
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeDedupHash, computeAddressHash, computePhoneHash } from './lib/dedup';

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
  address_dedup_hash: string | null;
  phone_dedup_hash: string | null;
}

async function fetchAll(): Promise<HotelRow[]> {
  const PAGE = 1000;
  const all: HotelRow[] = [];
  for (let off = 0; ; off += PAGE) {
    const { data, error } = await sb
      .from('hotels')
      .select('id, name, address, phone, dedup_hash, address_dedup_hash, phone_dedup_hash')
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

  let nameChanged = 0;
  let addrChanged = 0;
  let phoneChanged = 0;

  // 衝突分析（同じ住所/電話を持つ既存ホテルがあるか）
  const addrCount = new Map<string, number>();
  const phoneCount = new Map<string, number>();

  const updates: Array<{
    id: string;
    dedup_hash: string;
    address_dedup_hash: string | null;
    phone_dedup_hash: string | null;
  }> = [];

  for (const h of hotels) {
    const newName = computeDedupHash({ name: h.name, address: h.address, phone: h.phone });
    const newAddr = computeAddressHash(h.address);
    const newPhone = computePhoneHash(h.phone);

    if (newAddr) addrCount.set(newAddr, (addrCount.get(newAddr) ?? 0) + 1);
    if (newPhone) phoneCount.set(newPhone, (phoneCount.get(newPhone) ?? 0) + 1);

    const changed =
      newName !== h.dedup_hash ||
      newAddr !== h.address_dedup_hash ||
      newPhone !== h.phone_dedup_hash;

    if (changed) {
      if (newName !== h.dedup_hash) nameChanged++;
      if (newAddr !== h.address_dedup_hash) addrChanged++;
      if (newPhone !== h.phone_dedup_hash) phoneChanged++;
      updates.push({
        id: h.id,
        dedup_hash: newName,
        address_dedup_hash: newAddr,
        phone_dedup_hash: newPhone,
      });
    }
  }

  console.log(`📊 変更: name=${nameChanged}, address=${addrChanged}, phone=${phoneChanged} 件`);

  // 衝突件数
  const addrCollisions = [...addrCount.values()].filter((v) => v > 1).length;
  const phoneCollisions = [...phoneCount.values()].filter((v) => v > 1).length;
  console.log(`🔄 既存内 衝突: address同一 ${addrCollisions}件 / phone同一 ${phoneCollisions}件`);
  console.log('   （これらは別館・支店の可能性あり）');

  if (!APPLY) {
    console.log('\n--apply で実反映します');
    return;
  }

  console.log(`\n🔄 ${updates.length}件のhash更新中...`);
  let done = 0;
  for (const u of updates) {
    const { error } = await sb
      .from('hotels')
      .update({
        dedup_hash: u.dedup_hash,
        address_dedup_hash: u.address_dedup_hash,
        phone_dedup_hash: u.phone_dedup_hash,
      })
      .eq('id', u.id);
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
