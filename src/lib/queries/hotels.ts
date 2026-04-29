import { createServerClient } from '@/lib/supabase/server';
import type { DogHotelInfo } from '@/lib/microcms';

// Supabaseから取得した宿レコードを既存 DogHotelInfo 形に変換する。
// 既存の convertMicroCMSToHotelDetail() がそのまま流用できるため、
// ページ層・コンポーネント層の改修ゼロでデータ源だけ切り替わる。

type SbHotelRow = {
  id: string;
  name: string;
  address: string;
  access: string | null;
  lat: number | string | null;
  lng: number | string | null;
  phone: string | null;
  website_url: string | null;
  hotel_type: string;
  checkin_time: string | null;
  checkout_time: string | null;
  parking: string | null;
  prefecture: { name: string } | { name: string }[] | null;
  dog_policy: SbDogPolicy | SbDogPolicy[] | null;
  amenities: { amenity: { slug: string; name: string } | { slug: string; name: string }[] }[] | null;
  images: SbImage[] | null;
};

type SbDogPolicy = {
  accepted_sizes: string[] | null;
  max_dogs: number | null;
  dog_fee: number | null;
  dog_fee_note: string | null;
  dog_free_in_room: boolean | null;
  notes: string | null;
};

type SbImage = {
  storage_path: string;
  is_main: boolean | null;
  sort_order: number | null;
};

// 1:n / 1:1 が array で返る場合と object で返る場合の両対応
function unwrap<T>(v: T | T[] | null | undefined): T | undefined {
  if (!v) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

const HOTEL_SELECT = `
  id, name, address, access, lat, lng, phone, website_url,
  hotel_type, checkin_time, checkout_time, parking,
  prefecture:prefectures(name),
  dog_policy:hotel_dog_policies(accepted_sizes, max_dogs, dog_fee, dog_fee_note, dog_free_in_room, notes),
  amenities:hotel_amenities(amenity:amenities(slug, name)),
  images:hotel_images(storage_path, is_main, sort_order)
`;

// レガシーID（microCMSのcontentId）からSupabase経由で宿を取得
export async function getHotelByLegacyId(legacyId: string): Promise<DogHotelInfo | null> {
  try {
    const sb = createServerClient();
    const { data, error } = await sb
      .from('hotel_sources')
      .select(`hotel:hotels(${HOTEL_SELECT})`)
      .eq('source_type', 'manual')
      .eq('source_id', legacyId)
      .maybeSingle();

    if (error) {
      console.error('getHotelByLegacyId error:', error);
      return null;
    }
    const hotel = unwrap((data as { hotel?: SbHotelRow | SbHotelRow[] } | null)?.hotel);
    if (!hotel) return null;

    return toDogHotelInfo(hotel, legacyId);
  } catch (e) {
    console.error('getHotelByLegacyId exception:', e);
    return null;
  }
}

// status='published' な全宿のレガシーIDを返す（generateStaticParams 用）
// Supabase のデフォルト上限1000件を回避するためページネーション
export async function listAllLegacyIds(): Promise<string[]> {
  try {
    const sb = createServerClient();
    const PAGE = 1000;
    const all: string[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await sb
        .from('hotel_sources')
        .select('source_id, hotel:hotels!inner(status)')
        .eq('source_type', 'manual')
        .eq('hotel.status', 'published')
        .range(offset, offset + PAGE - 1);
      if (error || !data || data.length === 0) break;
      for (const row of data) {
        const id = (row as { source_id: string | null }).source_id;
        if (id) all.push(id);
      }
      if (data.length < PAGE) break;
    }
    return all;
  } catch {
    return [];
  }
}

// 都道府県スラグから宿一覧を取得
export async function listHotelsByPrefectureSlug(prefectureSlug: string): Promise<DogHotelInfo[]> {
  try {
    const sb = createServerClient();
    const { data: pref } = await sb
      .from('prefectures')
      .select('id, name')
      .eq('slug', prefectureSlug)
      .maybeSingle();
    if (!pref) return [];

    const { data, error } = await sb
      .from('hotels')
      .select(`${HOTEL_SELECT}, sources:hotel_sources(source_id, source_type)`)
      .eq('prefecture_id', pref.id)
      .eq('status', 'published')
      .limit(200);
    if (error || !data) return [];

    return data.map((h: SbHotelRow & { sources?: { source_id: string; source_type: string }[] }) => {
      const legacyId =
        h.sources?.find((s) => s.source_type === 'manual')?.source_id ?? h.id;
      return toDogHotelInfo(h, legacyId);
    });
  } catch {
    return [];
  }
}

// =============================================================
// 変換
// =============================================================
function toDogHotelInfo(h: SbHotelRow, legacyId: string): DogHotelInfo {
  const dogPolicy = unwrap(h.dog_policy);
  const sizes = dogPolicy?.accepted_sizes ?? [];
  const amenitySlugs = new Set<string>(
    (h.amenities ?? [])
      .map((a) => unwrap(a.amenity)?.slug)
      .filter((s): s is string => !!s),
  );

  const sortedImages = [...(h.images ?? [])].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1;
    if (!a.is_main && b.is_main) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
  const mainImage = sortedImages.find((i) => i.is_main)?.storage_path
    || sortedImages[0]?.storage_path;
  const allImages = sortedImages.map((i) => i.storage_path);

  // hotel_type の英語enumを既存UIが期待する文字列っぽく戻す
  const HOTEL_TYPE_LABEL: Record<string, string> = {
    hotel: 'ホテル',
    ryokan: '旅館',
    pension: 'ペンション',
    cottage: 'コテージ・貸別荘',
    glamping: 'グランピング',
    minshuku: '民宿',
    resort: 'リゾート',
    other: 'その他',
  };

  // dog_fee_note は "小型: 3000 / 中型: 4000" 形式で保存している
  const fees = parseDogFeeNote(dogPolicy?.dog_fee_note ?? null);

  return {
    id: legacyId,
    createdAt: '',
    updatedAt: '',
    publishedAt: '',
    revisedAt: '',
    hotelName: h.name,
    officialWebsite: h.website_url ?? undefined,
    prefecture: unwrap(h.prefecture)?.name ?? '',
    address: h.address,
    access: h.access ?? undefined,
    hotelType: HOTEL_TYPE_LABEL[h.hotel_type] ?? h.hotel_type,
    checkinTime: h.checkin_time ?? undefined,
    checkoutTime: h.checkout_time ?? undefined,
    phoneNumber: h.phone ?? undefined,
    paymentInfo: undefined,
    parking: amenitySlugs.has('parking') || !!h.parking,
    shuttle: amenitySlugs.has('shuttle'),
    hotSpring: amenitySlugs.has('onsen'),
    privateOnsenRoom: amenitySlugs.has('private-onsen'),
    smallDog: sizes.includes('small'),
    mediumDog: sizes.includes('medium'),
    largeDog: sizes.includes('large'),
    multipleDogs: (dogPolicy?.max_dogs ?? 1) > 1,
    dogRunOnSite: amenitySlugs.has('dog-run'),
    roomDogRun: amenitySlugs.has('room-dog-run'),
    petAmenities: undefined,
    diningWithDog: amenitySlugs.has('dining-together'),
    dogMenu: amenitySlugs.has('dog-menu'),
    smallDogFee: fees.small,
    mediumDogFee: fees.medium,
    largeDogFee: fees.large,
    groomingRoom: amenitySlugs.has('grooming-room'),
    leashFreeInside: amenitySlugs.has('leash-free'),
    otherNotes: dogPolicy?.notes ?? undefined,
    image: mainImage,
    images: allImages.length > 0 ? allImages : undefined,
    latitude: h.lat != null ? Number(h.lat) : undefined,
    longitude: h.lng != null ? Number(h.lng) : undefined,
  };
}

function parseDogFeeNote(note: string | null): { small?: string; medium?: string; large?: string } {
  if (!note) return {};
  const out: { small?: string; medium?: string; large?: string } = {};
  const segs = note.split('/').map((s) => s.trim());
  for (const seg of segs) {
    const m = seg.match(/^(小型|中型|大型)[:：]\s*(.+)$/);
    if (!m) continue;
    if (m[1] === '小型') out.small = m[2];
    else if (m[1] === '中型') out.medium = m[2];
    else if (m[1] === '大型') out.large = m[2];
  }
  return out;
}
