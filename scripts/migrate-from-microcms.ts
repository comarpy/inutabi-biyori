/**
 * microCMS → Supabase 移行スクリプト
 *
 * 使い方:
 *   npx tsx scripts/migrate-from-microcms.ts          # dry-run（保存しない）
 *   npx tsx scripts/migrate-from-microcms.ts --apply  # 実際にINSERT
 *
 * 前提:
 *   .env.local に以下が設定されていること
 *     MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY, MICROCMS_DOG_HOTELS_ENDPOINT
 *     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import 'dotenv/config';
import { createHash } from 'node:crypto';
import { config as loadEnv } from 'dotenv';
import { createClient as createMicroCMS } from 'microcms-js-sdk';
import { createClient as createSupabase } from '@supabase/supabase-js';

loadEnv({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');
const log = (...args: unknown[]) => console.log(...args);

// ---------------------------------------------------------------
// 環境変数
// ---------------------------------------------------------------
const MICROCMS_DOMAIN = required('MICROCMS_SERVICE_DOMAIN');
const MICROCMS_API_KEY = required('MICROCMS_API_KEY');
const MICROCMS_ENDPOINT = process.env.MICROCMS_DOG_HOTELS_ENDPOINT || 'dog-hotels';
const SUPABASE_URL = required('SUPABASE_URL') || required('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_SERVICE_KEY = required('SUPABASE_SERVICE_ROLE_KEY');

function required(name: string) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v;
}

// ---------------------------------------------------------------
// クライアント
// ---------------------------------------------------------------
const microCMS = createMicroCMS({
  serviceDomain: MICROCMS_DOMAIN,
  apiKey: MICROCMS_API_KEY,
});

const sb = createSupabase(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------
const toBool = (v: unknown): boolean => {
  if (typeof v === 'boolean') return v;
  const s = String(v ?? '').trim();
  return s === 'OK' || s === '有' || s === 'あり' || s === 'Yes' || s === 'yes' || s === 'true' || s === 'TRUE';
};

const isFalsy = (v: unknown): boolean => {
  const s = String(v ?? '').trim();
  return s === 'NG' || s === '無' || s === 'なし' || s === 'No' || s === 'no' || s === 'false' || s === 'FALSE';
};

const toNum = (v: unknown): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const extractImageUrl = (v: unknown): string | null => {
  if (!v) return null;
  if (typeof v === 'string') return v || null;
  if (typeof v === 'object' && v && 'url' in v && typeof (v as { url: unknown }).url === 'string') {
    return (v as { url: string }).url;
  }
  return null;
};

const extractImageUrls = (v: unknown): string[] => {
  if (!Array.isArray(v)) return [];
  return v.map(extractImageUrl).filter((u): u is string => !!u);
};

// 住所・宿名の正規化（重複判定用）
const normalizeForHash = (s: string) =>
  s
    .normalize('NFKC')                         // 全角半角統一
    .replace(/\s+/g, '')                       // 空白除去
    .replace(/[（）()「」『』〜〜～\-‐ー―]/g, '') // 記号除去
    .replace(/(株式会社|有限会社|合同会社)/g, '')
    .toLowerCase();

const computeDedupHash = (name: string, address: string, phone?: string): string => {
  const n = normalizeForHash(name);
  const a = normalizeForHash(address);
  const t = (phone ?? '').replace(/\D/g, '').slice(-4);
  return createHash('sha256').update(`${n}|${a}|${t}`).digest('hex');
};

// 日本語→ローマ字スラグ（簡易版）。失敗時はmicroCMS contentIdを使う。
const slugFromId = (id: string) => `legacy-${id}`;

// 宿タイプマッピング
const mapHotelType = (raw: unknown): string => {
  const s = String(raw ?? '').trim();
  if (s.includes('ホテル')) return 'hotel';
  if (s.includes('旅館')) return 'ryokan';
  if (s.includes('ペンション')) return 'pension';
  if (s.includes('コテージ') || s.includes('貸別荘')) return 'cottage';
  if (s.includes('グランピング')) return 'glamping';
  if (s.includes('民宿')) return 'minshuku';
  if (s.includes('リゾート')) return 'resort';
  return 'other';
};

// 犬サイズ
const buildDogSizes = (rec: any): string[] => {
  const sizes: string[] = [];
  if (toBool(rec.small_dog) && !isFalsy(rec.small_dog)) sizes.push('small');
  if (toBool(rec.medium_dog) && !isFalsy(rec.medium_dog)) sizes.push('medium');
  if (toBool(rec.large_dog) && !isFalsy(rec.large_dog)) sizes.push('large');
  return sizes;
};

// 設備フラグ → amenity slug
const amenityFromRecord = (rec: any): string[] => {
  const slugs: string[] = [];
  const add = (cond: boolean, slug: string) => { if (cond) slugs.push(slug); };

  add(toBool(rec.dog_run_on_site)  && !isFalsy(rec.dog_run_on_site),  'dog-run');
  add(toBool(rec.dog_run_in_room)  && !isFalsy(rec.dog_run_in_room),  'room-dog-run');
  add(toBool(rec.grooming_room)    && !isFalsy(rec.grooming_room),    'grooming-room');
  add(toBool(rec.meal_together),                                       'dining-together');
  add(toBool(rec.dog_menu)         && !isFalsy(rec.dog_menu),         'dog-menu');
  add(toBool(rec.lead_ok_inside),                                      'leash-free');
  add(toBool(rec.onsen)            && !isFalsy(rec.onsen),            'onsen');
  add(toBool(rec.open_air_bath_room) && !isFalsy(rec.open_air_bath_room), 'private-onsen');
  add(toBool(rec.parking)          && !isFalsy(rec.parking),          'parking');
  add(toBool(rec.shuttle)          && !isFalsy(rec.shuttle),          'shuttle');

  return slugs;
};

// ---------------------------------------------------------------
// メイン
// ---------------------------------------------------------------
async function main() {
  log(APPLY ? '🚀 APPLYモード（実際にINSERT）' : '🔍 DRY-RUNモード（保存しません。--apply で実行）');

  // 1. 都道府県・設備マスタを Supabase から取得
  const [prefRes, amenityRes] = await Promise.all([
    sb.from('prefectures').select('id, name'),
    sb.from('amenities').select('id, slug'),
  ]);

  if (prefRes.error || amenityRes.error || !prefRes.data || !amenityRes.data) {
    console.error('マスタ取得失敗:');
    if (prefRes.error)    console.error('  prefectures error:', prefRes.error);
    if (amenityRes.error) console.error('  amenities error:',   amenityRes.error);
    console.error(`  prefectures.length=${prefRes.data?.length}`);
    console.error(`  amenities.length=${amenityRes.data?.length}`);
    console.error(`  SUPABASE_URL=${process.env.SUPABASE_URL ?? '(未設定)'}`);
    console.error(`  service key prefix=${(process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 20)}...`);
    process.exit(1);
  }
  const prefs = prefRes.data;
  const amenities = amenityRes.data;

  const prefByName = new Map(prefs.map((p: any) => [p.name, p.id]));
  const amenityIdBySlug = new Map(amenities.map((a: any) => [a.slug, a.id]));

  log(`📋 マスタ: prefectures=${prefs.length}, amenities=${amenities.length}`);

  // 2. microCMSから全件取得
  const all: any[] = [];
  let offset = 0;
  while (true) {
    const res: any = await microCMS.get({
      endpoint: MICROCMS_ENDPOINT,
      queries: { limit: 100, offset },
    });
    const contents = res?.contents ?? [];
    all.push(...contents);
    if (contents.length < 100) break;
    offset += 100;
  }
  log(`📥 microCMSから取得: ${all.length}件`);

  // 3. 1件ずつ変換・投入
  const stats = { ok: 0, skip_dup: 0, skip_no_pref: 0, error: 0 };

  for (const rec of all) {
    const prefName = String(rec.area ?? '').trim();
    const prefId = prefByName.get(prefName);
    if (!prefId) {
      console.warn(`⚠️  都道府県不明: "${prefName}" (id=${rec.id} name=${rec.name})`);
      stats.skip_no_pref++;
      continue;
    }

    const name = String(rec.name ?? '').trim();
    const address = String(rec.address ?? '').trim();
    const phone = String(rec.phone_number ?? '').trim();
    if (!name || !address) {
      console.warn(`⚠️  必須欠落: name=${name} addr=${address} (id=${rec.id})`);
      stats.error++;
      continue;
    }

    const dedupHash = computeDedupHash(name, address, phone);
    const slug = slugFromId(rec.id);

    // 既存チェック（dedup_hashで）
    const { data: existing } = await sb
      .from('hotels')
      .select('id')
      .eq('dedup_hash', dedupHash)
      .maybeSingle();

    if (existing) {
      log(`⏭  重複スキップ: ${name} (既存hotel.id=${existing.id})`);
      stats.skip_dup++;
      continue;
    }

    const lat = toNum(rec.latitude ?? rec.lat);
    const lng = toNum(rec.longitude ?? rec.lng ?? rec.lon);

    const hotelRow = {
      prefecture_id: prefId,
      name,
      slug,
      description: null,
      postal_code: null,
      address,
      lat,
      lng,
      phone: phone || null,
      website_url: rec.official_website || null,
      hotel_type: mapHotelType(rec.accommodation_type),
      checkin_time: parseTimeOrNull(rec.check_in),
      checkout_time: parseTimeOrNull(rec.check_out),
      parking: rec.parking ? String(rec.parking).slice(0, 100) : null,
      access: rec.access || null,
      status: 'published',  // microCMSにあったものは全て公開済みとして移行
      dedup_hash: dedupHash,
    };

    const dogPolicyRow = {
      accepted_sizes: buildDogSizes(rec),
      max_dogs: toBool(rec.multiple_dogs) ? 3 : 1,  // 仮値、後で見直し
      dog_fee: pickDogFee(rec),
      dog_fee_note: buildDogFeeNote(rec),
      dog_free_in_room: toBool(rec.lead_ok_inside),
      notes: rec.other || null,
    };

    const amenitySlugs = amenityFromRecord(rec);

    const mainImage = extractImageUrl(rec.image) || extractImageUrl(rec.main_image);
    const galleryImages = [
      ...extractImageUrls(rec.images),
      ...extractImageUrls(rec.gallery),
    ].filter((u) => u !== mainImage);

    if (!APPLY) {
      log(`📝 [DRY] ${name} → slug=${slug}, sizes=${dogPolicyRow.accepted_sizes.join('/')}, amenities=${amenitySlugs.length}, images=${(mainImage ? 1 : 0) + galleryImages.length}`);
      stats.ok++;
      continue;
    }

    try {
      // hotels INSERT
      const { data: inserted, error: e1 } = await sb
        .from('hotels')
        .insert(hotelRow)
        .select('id')
        .single();
      if (e1 || !inserted) throw e1 ?? new Error('insert hotels failed');
      const hotelId = inserted.id;

      // dog_policies
      const { error: e2 } = await sb
        .from('hotel_dog_policies')
        .insert({ hotel_id: hotelId, ...dogPolicyRow });
      if (e2) throw e2;

      // amenities
      if (amenitySlugs.length > 0) {
        const rows = amenitySlugs
          .map((s) => amenityIdBySlug.get(s))
          .filter((id): id is string => !!id)
          .map((amenity_id) => ({ hotel_id: hotelId, amenity_id }));
        if (rows.length > 0) {
          const { error: e3 } = await sb.from('hotel_amenities').insert(rows);
          if (e3) throw e3;
        }
      }

      // images（URL直保存。Storage移行は別タスク）
      const imageRows: any[] = [];
      if (mainImage) imageRows.push({ hotel_id: hotelId, storage_path: mainImage, is_main: true, sort_order: 0 });
      galleryImages.forEach((u, i) => imageRows.push({ hotel_id: hotelId, storage_path: u, is_main: false, sort_order: i + 1 }));
      if (imageRows.length > 0) {
        const { error: e4 } = await sb.from('hotel_images').insert(imageRows);
        if (e4) throw e4;
      }

      // hotel_sources（出典 = microCMS contentId）
      const { error: e5 } = await sb.from('hotel_sources').insert({
        hotel_id: hotelId,
        source_type: 'manual',
        source_id: rec.id,
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: 'ok',
      });
      if (e5) throw e5;

      // 監査ログ
      await sb.from('hotel_revisions').insert({
        hotel_id: hotelId,
        changed_by: 'migration:microcms',
        change_type: 'create',
        diff: { source: 'microcms', source_id: rec.id },
      });

      log(`✅ ${name} (hotel.id=${hotelId})`);
      stats.ok++;
    } catch (err) {
      console.error(`❌ ${name} (id=${rec.id})`, err);
      stats.error++;
    }
  }

  log('---');
  log(`📊 結果: ${JSON.stringify(stats)}`);
}

function parseTimeOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim();
  // "15:00" / "15時" / "15:00〜" などを 'HH:MM:SS' に
  const m = s.match(/(\d{1,2}):?(\d{0,2})/);
  if (!m) return null;
  const h = String(parseInt(m[1], 10)).padStart(2, '0');
  const min = m[2] ? String(parseInt(m[2], 10)).padStart(2, '0') : '00';
  return `${h}:${min}:00`;
}

function pickDogFee(rec: any): number | null {
  const candidates = [rec.dog_fee_small, rec.dog_fee_medium, rec.dog_fee_large];
  for (const c of candidates) {
    const n = String(c ?? '').match(/\d+/);
    if (n) return parseInt(n[0], 10);
  }
  return null;
}

function buildDogFeeNote(rec: any): string | null {
  const parts: string[] = [];
  if (rec.dog_fee_small)  parts.push(`小型: ${rec.dog_fee_small}`);
  if (rec.dog_fee_medium) parts.push(`中型: ${rec.dog_fee_medium}`);
  if (rec.dog_fee_large)  parts.push(`大型: ${rec.dog_fee_large}`);
  return parts.length > 0 ? parts.join(' / ') : null;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
