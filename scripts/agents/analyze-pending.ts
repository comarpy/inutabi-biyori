/**
 * discovery_queue の pending 候補を分析する
 *   npx tsx scripts/agents/analyze-pending.ts
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { computeDedupHash, normalizeForHash } from './lib/dedup';

loadEnv({ path: '.env.local' });

const sb = createClient(
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

interface QueueRow {
  id: string;
  candidate_name: string;
  candidate_address: string | null;
  raw_payload: Record<string, unknown> | null;
}

async function main() {
  const { data, error } = await sb
    .from('discovery_queue')
    .select('id, candidate_name, candidate_address, raw_payload')
    .eq('status', 'pending')
    .limit(200);
  if (error || !data) {
    console.error(error);
    return;
  }
  const rows = data as QueueRow[];
  console.log(`📊 pending候補: ${rows.length}件\n`);

  // 1. キーワードベース分類
  const dogKeywords = ['犬', 'ドッグ', 'ＤＯＧ', 'DOG', 'わんこ', 'ワンコ', 'ＷＡＮ', 'WAN', 'ペット', 'ＰＥＴ', 'PET', '愛犬'];
  const matchesDogKeyword = (name: string) => dogKeywords.some((k) => name.includes(k));

  const hasDogKeyword = rows.filter((r) => matchesDogKeyword(r.candidate_name));
  const noDogKeyword = rows.filter((r) => !matchesDogKeyword(r.candidate_name));

  console.log(`🐕 名前に犬関連キーワードあり: ${hasDogKeyword.length}件`);
  console.log(`❓ 名前に犬関連キーワードなし: ${noDogKeyword.length}件`);
  console.log('   （後者はホテル説明に「ペット可」と書いてあっただけの可能性あり）\n');

  // 2. 既存hotels との「あいまい一致」をチェック（dedup_hashは厳密だが、表記揺れで漏れている可能性）
  const { data: existingHotels } = await sb
    .from('hotels')
    .select('name, address')
    .range(0, 9999);

  const existingByNormalizedName = new Map<string, { name: string; address: string }>();
  for (const h of existingHotels ?? []) {
    existingByNormalizedName.set(normalizeForHash(h.name), h);
  }

  const fuzzyMatches: Array<{ candidate: string; existing: string }> = [];
  for (const row of rows) {
    const normalized = normalizeForHash(row.candidate_name);
    // 候補名で部分一致を探す
    for (const [existingNorm, existing] of existingByNormalizedName) {
      if (normalized === existingNorm) continue; // dedup_hashで弾かれているはず
      if (normalized.length < 4 || existingNorm.length < 4) continue;
      if (normalized.includes(existingNorm) || existingNorm.includes(normalized)) {
        fuzzyMatches.push({ candidate: row.candidate_name, existing: existing.name });
        break;
      }
    }
  }

  console.log(`🔎 既存宿名との部分一致: ${fuzzyMatches.length}件`);
  if (fuzzyMatches.length > 0) {
    console.log('   （表記揺れで誤って新規扱いされている可能性）');
    for (const m of fuzzyMatches.slice(0, 10)) {
      console.log(`   - 候補: "${m.candidate}"`);
      console.log(`     既存: "${m.existing}"`);
    }
    if (fuzzyMatches.length > 10) console.log(`   ...他 ${fuzzyMatches.length - 10}件`);
  }

  // 3. 都道府県分布
  console.log('\n📍 都道府県分布:');
  const prefCounts = new Map<string, number>();
  for (const row of rows) {
    const m = (row.candidate_address ?? '').match(/^(.{2,3}?[都道府県])/);
    const pref = m ? m[1] : '不明';
    prefCounts.set(pref, (prefCounts.get(pref) ?? 0) + 1);
  }
  const sorted = [...prefCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [pref, c] of sorted) {
    console.log(`   ${pref}: ${c}件`);
  }

  // 4. 「明らかに犬OKじゃなさそう」な候補を抽出
  console.log('\n⚠️  キーワードなし候補（最大15件、表記サンプル）:');
  for (const row of noDogKeyword.slice(0, 15)) {
    console.log(`   - ${row.candidate_name}`);
    console.log(`     ${row.candidate_address}`);
  }

  // 5. レビュー件数の分布（楽天評価）
  console.log('\n⭐ 楽天レビュー件数の分布:');
  const reviewBuckets = { 'reviewCount=0': 0, '1-9': 0, '10-49': 0, '50-99': 0, '100+': 0 };
  for (const row of rows) {
    const cnt = Number(row.raw_payload?.reviewCount ?? 0);
    if (cnt === 0) reviewBuckets['reviewCount=0']++;
    else if (cnt < 10) reviewBuckets['1-9']++;
    else if (cnt < 50) reviewBuckets['10-49']++;
    else if (cnt < 100) reviewBuckets['50-99']++;
    else reviewBuckets['100+']++;
  }
  for (const [k, v] of Object.entries(reviewBuckets)) {
    console.log(`   ${k}: ${v}件`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
