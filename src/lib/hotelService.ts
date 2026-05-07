import type { ComponentType, SVGProps } from 'react';
import { fetchRakutenHotels, RakutenHotel, fetchRakutenHotelDetail, fetchRakutenHotelImages, withAffiliate, searchRakutenByKeyword, buildRakutenSearchUrl } from './rakuten';
import { getDogHotels, getDogHotelById, searchDogHotelsByPrefecture, DogHotelInfo } from './microcms';
import { getHotelByLegacyId } from './queries/hotels';
import { Dog, Car, Bath, UtensilsCrossed } from 'lucide-react';
import { devLog, devWarn } from './logger';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

// フロントエンドで期待される形式
// id: microCMSレコードID（例: "j7x8abc1"）または楽天ホテル（"r_<hotelNo>"）
export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  amenities: string[]; // 文字列の配列
  image: string;
  coordinates: [number, number];
  reviewAverage?: number;
  reviewCount?: number;
  // 犬サイズ対応（microCMS のみ。楽天データは undefined）
  smallDog?: boolean;
  mediumDog?: boolean;
  largeDog?: boolean;
}

export interface EnrichedHotel {
  hotelNo: string;
  hotelName: string;
  planListUrl: string;
  dpPlanListUrl: string;
  reviewAverage: number;
  reviewCount: number;
  hotelImageUrl: string;
  hotelThumbnailUrl: string;
  hotelMapImageUrl: string;
  address1: string;
  address2: string;
  access: string;
  telephoneNo: string;
  faxNo: string;
  parkingInformation: string;
  nearestStation: string;
  hotelComment: string;
}

// 都道府県の概ねの中心座標
const PREFECTURE_COORDS: Record<string, [number, number]> = {
  '北海道': [43.2203, 142.8635],
  '青森県': [40.8243, 140.7400],
  '岩手県': [39.7036, 141.1527],
  '宮城県': [38.2688, 140.8721],
  '秋田県': [39.7186, 140.1024],
  '山形県': [38.2404, 140.3633],
  '福島県': [37.7500, 140.4676],
  '茨城県': [36.3418, 140.4468],
  '栃木県': [36.5657, 139.8836],
  '群馬県': [36.3911, 139.0608],
  '埼玉県': [35.8569, 139.6489],
  '千葉県': [35.6074, 140.1233],
  '東京都': [35.6895, 139.6917],
  '神奈川県': [35.4478, 139.6425],
  '新潟県': [37.9022, 139.0233],
  '富山県': [36.6953, 137.2113],
  '石川県': [36.5946, 136.6256],
  '福井県': [36.0652, 136.2216],
  '山梨県': [35.6635, 138.5684],
  '長野県': [36.2048, 138.0949],
  '岐阜県': [35.3912, 136.7223],
  '静岡県': [34.9769, 138.3831],
  '愛知県': [35.1802, 136.9066],
  '三重県': [34.7302, 136.5087],
  '滋賀県': [35.0045, 135.8686],
  '京都府': [35.0211, 135.7556],
  '大阪府': [34.6862, 135.5198],
  '兵庫県': [34.6913, 135.1830],
  '奈良県': [34.6850, 135.8329],
  '和歌山県': [34.2260, 135.1675],
  '鳥取県': [35.5038, 134.2381],
  '島根県': [35.4724, 133.0505],
  '岡山県': [34.6617, 133.9350],
  '広島県': [34.3963, 132.4596],
  '山口県': [34.1859, 131.4706],
  '徳島県': [34.0658, 134.5593],
  '香川県': [34.3401, 134.0434],
  '愛媛県': [33.8416, 132.7657],
  '高知県': [33.5597, 133.5311],
  '福岡県': [33.6064, 130.4181],
  '佐賀県': [33.2494, 130.2989],
  '長崎県': [32.7448, 129.8737],
  '熊本県': [32.7898, 130.7417],
  '大分県': [33.2382, 131.6126],
  '宮崎県': [31.9111, 131.4239],
  '鹿児島県': [31.5602, 130.5581],
  '沖縄県': [26.2125, 127.6809],
  '全国': [36.2048, 138.2529],
};

// 座標を生成する関数（都道府県 + ホテル名ハッシュで決定論的に散らす）
// 楽天から実座標が取れないホテルのフォールバック
function generateCoordinates(prefecture: string, seed: string | number): [number, number] {
  // prefecture が "北海道 札幌市..." のように住所が含まれる場合に備え、前方マッチで都道府県抽出
  let key = prefecture;
  if (!PREFECTURE_COORDS[key]) {
    const hit = Object.keys(PREFECTURE_COORDS).find((p) => prefecture?.startsWith(p));
    if (hit) key = hit;
  }
  const base = PREFECTURE_COORDS[key] || PREFECTURE_COORDS['全国'];

  const seedStr = String(seed);
  const hash = seedStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0) * 31, 0);
  // 緯度 ±0.25度（約 25km）、経度 ±0.35度 でバラけさせる。同県内に散らばる範囲。
  const latOffset = ((hash * 7) % 10000 - 5000) / 10000 * 0.5;
  const lngOffset = ((hash * 13) % 10000 - 5000) / 10000 * 0.7;
  return [base[0] + latOffset, base[1] + lngOffset];
}

// アメニティを生成する関数（楽天API経由の汎用ホテル用のデフォルト表示）
function generateAmenities(): string[] {
  return ['ペット同伴可', '駐車場', 'Wi-Fi', '温泉', 'ペット同伴食事'];
}

// 価格を生成する関数（楽天APIから実際の価格を取得）
function generatePrice(reviewAverage: number, hotelMinCharge?: number): number {
  // 楽天APIから実際の価格が取得できる場合はそれを使用
  if (hotelMinCharge && hotelMinCharge > 0) {
    return hotelMinCharge;
  }
  
  // 実際の価格が取得できない場合は、レビュー評価に基づいて生成
  const basePrice = 8000;
  const multiplier = reviewAverage > 4 ? 1.5 : reviewAverage > 3 ? 1.2 : 1.0;
  return Math.floor(basePrice * multiplier);
}

// 画像未登録宿のフォールバック（汎用プレースホルダ）
const PLACEHOLDER_IMAGE = '/images/画像2.jpeg';

// 詳細条件のインターフェース
export interface DetailFilters {
  dogRun?: boolean;
  smallDog?: boolean;
  mediumDog?: boolean;
  largeDog?: boolean;
  roomDining?: boolean;
  hotSpring?: boolean;
  parking?: boolean;
  multipleDogs?: boolean;
  petAmenities?: boolean;
  dogMenu?: boolean;
  privateBath?: boolean;
  roomDogRun?: boolean;
  grooming?: boolean;
  leashFree?: boolean;
}

// 汎用タイムアウトヘルパー
async function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms))
  ]);
}

// 宿名 -> 楽天マッチ情報のインメモリキャッシュ（TTL 24h）
interface RakutenNameMatchCache {
  image?: string;
  planListUrl?: string;
  reviewAverage?: number;
  reviewCount?: number;
  latitude?: number;
  longitude?: number;
  missing: boolean;
  cachedAt: number;
}
const rakutenMatchCache = new Map<string, RakutenNameMatchCache>();
const MATCH_CACHE_TTL = 24 * 60 * 60 * 1000;

// エリア単位の楽天ホテル一覧キャッシュ（30分）
// サーバレスインスタンス単位だが、CDN キャッシュと併用すれば実質的に十分速い
interface RakutenAreaCache {
  hotels: RakutenHotel[];
  cachedAt: number;
}
const rakutenAreaCache = new Map<string, RakutenAreaCache>();
const AREA_CACHE_TTL = 30 * 60 * 1000;

async function getRakutenForArea(area: string): Promise<RakutenHotel[]> {
  const now = Date.now();
  const cached = rakutenAreaCache.get(area);
  if (cached && (now - cached.cachedAt) < AREA_CACHE_TTL) {
    return cached.hotels;
  }
  // 短めタイムアウト(800ms)。失敗時は空配列でフォールバック。
  const hotels = await withTimeout(fetchRakutenHotels(area), 800, [] as RakutenHotel[]);
  rakutenAreaCache.set(area, { hotels, cachedAt: now });
  return hotels;
}

// 並列度を制限したマップ
async function mapWithConcurrency<T>(items: T[], fn: (item: T) => Promise<void>, concurrency: number): Promise<void> {
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

async function getRakutenMatchByName(hotelName: string): Promise<RakutenNameMatchCache | null> {
  const now = Date.now();
  const cached = rakutenMatchCache.get(hotelName);
  if (cached && (now - cached.cachedAt) < MATCH_CACHE_TTL) {
    return cached.missing ? null : cached;
  }
  const results = await searchRakutenByKeyword(hotelName).catch(() => []);
  if (results.length === 0) {
    rakutenMatchCache.set(hotelName, { missing: true, cachedAt: now });
    return null;
  }
  const best = results[0];
  const entry: RakutenNameMatchCache = {
    image: best.hotelImageUrl || best.roomImageUrl || best.hotelThumbnailUrl || undefined,
    planListUrl: best.planListUrl || best.dpPlanListUrl || undefined,
    reviewAverage: best.reviewAverage || undefined,
    reviewCount: best.reviewCount || undefined,
    latitude: best.latitude || undefined,
    longitude: best.longitude || undefined,
    missing: false,
    cachedAt: now,
  };
  rakutenMatchCache.set(hotelName, entry);
  return entry;
}

export async function searchDogFriendlyHotels(
  areas: string[],
  checkinDate?: string,
  checkoutDate?: string,
  detailFilters?: DetailFilters
): Promise<Hotel[]> {
  try {
    devLog('検索パラメータ:', { areas, checkinDate, checkoutDate, detailFilters });
    
    // 並行してmicroCMSと楽天APIからデータを取得
    devLog('=== データ取得開始 ===');

    // 犬関連・設備の詳細条件が有効かどうか
    // 楽天データには犬サイズ等の構造化情報が無いため、これらが有効な時は楽天を混ぜない
    const hasSpecificFilter = !!detailFilters && Object.values(detailFilters).some(Boolean);

    // 各エリアを並列化。楽天データはエリアキャッシュから取得（初回のみ 800ms まで待つ、以降キャッシュ）
    // 画像・座標のマッチングに使う。
    const perAreaResults = await Promise.all(
      areas.map(async (area) => {
        const rakuten = await getRakutenForArea(area);
        const micro = await getMicroCMSHotels(area, detailFilters, rakuten);
        return { micro, rakuten };
      })
    );

    const allMicroCMSHotels: Hotel[] = [];
    const allRakutenHotels: RakutenHotel[] = [];
    perAreaResults.forEach(r => {
      allMicroCMSHotels.push(...r.micro);
      allRakutenHotels.push(...r.rakuten);
    });

    devLog('microCMSデータ件数:', allMicroCMSHotels.length);

    // 楽天APIのデータをHotel形式に変換（犬/設備フィルタが未指定の場合のみ混ぜる）
    let rakutenHotelsConverted: Hotel[] = [];
    if (!hasSpecificFilter && allRakutenHotels.length > 0) {
      devLog('楽天APIから取得したデータ件数:', allRakutenHotels.length);
      // microCMSで既にマッチ済みの楽天ホテルは重複を避けるため除外
      const usedRakutenNames = new Set(
        allMicroCMSHotels.map(h => h.name.toLowerCase().replace(/\s+/g, ''))
      );
      rakutenHotelsConverted = allRakutenHotels
        .filter(r => !usedRakutenNames.has(r.hotelName.toLowerCase().replace(/\s+/g, '')))
        .map((hotel: RakutenHotel, index: number) => ({
          id: `r_${hotel.hotelNo || `mock_${index}`}`,
          name: hotel.hotelName,
          location: `${hotel.address1} ${hotel.address2}`.trim() || '場所情報なし',
          price: generatePrice(hotel.reviewAverage, hotel.hotelMinCharge),
          amenities: generateAmenities(),
          image: hotel.hotelImageUrl || hotel.hotelThumbnailUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
          coordinates: (hotel.latitude && hotel.longitude)
            ? [hotel.latitude, hotel.longitude]
            : generateCoordinates(hotel.address1 || areas[0] || '全国', hotel.hotelNo || `r_${index}`),
          reviewAverage: hotel.reviewAverage || undefined,
          reviewCount: hotel.reviewCount || undefined,
        }));
    } else if (hasSpecificFilter) {
      devLog('詳細条件が指定されているため楽天データは除外（構造化情報が無いため）');
    }

    // microCMSと楽天APIのデータを統合（二次フィルタは廃止。microCMS側で正しくフィルタ済み）
    const allHotels: Hotel[] = [...allMicroCMSHotels, ...rakutenHotelsConverted];

    devLog('=== データ統合結果 ===');
    devLog('microCMS:', allMicroCMSHotels.length, '件');
    devLog('楽天API:', rakutenHotelsConverted.length, '件');
    devLog('合計:', allHotels.length, '件');

    return allHotels;
  } catch (error) {
    console.error('検索エラー:', error);
    // エラー時はmicroCMSデータのみを返す（最初のエリアのみ）
    try {
      devLog('エラー発生時のフォールバック: microCMSデータのみ取得');
      return await getMicroCMSHotels(areas[0] || '全国', detailFilters);
    } catch (fallbackError) {
      console.error('フォールバックも失敗:', fallbackError);
      return [];
    }
  }
}

// microCMSのデータをHotel形式に変換する関数（楽天APIから価格を検索）
async function convertMicroCMSToHotel(microCMSHotel: DogHotelInfo, index: number, rakutenHotels?: RakutenHotel[]): Promise<Hotel> {
  // 犬のサイズに基づいてアメニティを生成（文字列として）
  const amenities: string[] = [];
  if (microCMSHotel.smallDog || microCMSHotel.mediumDog || microCMSHotel.largeDog) amenities.push('ペット同伴可');
  if (microCMSHotel.parking) amenities.push('駐車場');
  if (microCMSHotel.hotSpring) amenities.push('温泉');
  if (microCMSHotel.diningWithDog) amenities.push('ペット同伴食事');
  if (microCMSHotel.dogRunOnSite) amenities.push('ドッグラン');
  amenities.push('Wi-Fi'); // 基本的にWifiは利用可能と仮定
  
  // 楽天APIから価格と画像を検索
  let price = 15000; // デフォルト基本料金
  let rakutenPrice: number | undefined;
  let hotelImage = '/images/画像2.jpeg'; // デフォルト画像
  let reviewAverage: number | undefined;
  let reviewCount: number | undefined;
  let latitude: number | undefined;
  let longitude: number | undefined;

  // microCMS で画像が手動入力されていれば最優先
  const manualImage = microCMSHotel.image || microCMSHotel.images?.[0];
  if (manualImage) {
    hotelImage = manualImage;
  }
  // microCMS で座標が手動入力されていれば最優先
  if (typeof microCMSHotel.latitude === 'number' && typeof microCMSHotel.longitude === 'number') {
    latitude = microCMSHotel.latitude;
    longitude = microCMSHotel.longitude;
  }

  if (rakutenHotels && Array.isArray(rakutenHotels)) {
    devLog(`${microCMSHotel.hotelName}: 楽天APIホテル数 ${rakutenHotels.length}件でマッチング試行中`);
    // 名前マッチングは厳格化（完全一致 or 8文字以上の前方一致）
    // 旧: 部分一致 / 住所部分一致 → 別宿に誤マッチして他宿の写真を表示するため廃止
    const matchedRakutenHotel = rakutenHotels.find(rakutenHotel => {
      const normalize = (s: string) => s.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[・・]/g, '')
        .replace(/[（）()]/g, '')
        .replace(/[ホテル|旅館|リゾート|温泉]/g, '');
      const a = normalize(microCMSHotel.hotelName);
      const b = normalize(rakutenHotel.hotelName);
      if (!a || !b) return false;
      if (a === b) return true;
      // 双方8文字以上 かつ 一方が他方の前方一致
      if (a.length >= 8 && b.length >= 8) {
        if (a.startsWith(b) || b.startsWith(a)) return true;
      }
      return false;
    });
    
    if (matchedRakutenHotel) {
      devLog(`楽天APIでマッチしたホテル: ${microCMSHotel.hotelName} -> ${matchedRakutenHotel.hotelName}`);
      rakutenPrice = generatePrice(matchedRakutenHotel.reviewAverage, matchedRakutenHotel.hotelMinCharge);
      if (matchedRakutenHotel.reviewAverage) reviewAverage = matchedRakutenHotel.reviewAverage;
      if (matchedRakutenHotel.reviewCount) reviewCount = matchedRakutenHotel.reviewCount;
      // 座標は microCMS 手動入力が最優先。未入力時のみ楽天から反映。
      if (!latitude && matchedRakutenHotel.latitude) latitude = matchedRakutenHotel.latitude;
      if (!longitude && matchedRakutenHotel.longitude) longitude = matchedRakutenHotel.longitude;

      // 画像は microCMS 手動入力が最優先。未入力時のみ楽天から反映。
      if (!manualImage) {
        if (matchedRakutenHotel.hotelImageUrl) {
          hotelImage = matchedRakutenHotel.hotelImageUrl;
          devLog(`${microCMSHotel.hotelName}: 楽天API画像を使用 (hotelImageUrl) -> ${hotelImage}`);
        } else if (matchedRakutenHotel.hotelThumbnailUrl) {
          hotelImage = matchedRakutenHotel.hotelThumbnailUrl;
          devLog(`${microCMSHotel.hotelName}: 楽天API画像を使用 (hotelThumbnailUrl) -> ${hotelImage}`);
        } else if (matchedRakutenHotel.roomImageUrl) {
          hotelImage = matchedRakutenHotel.roomImageUrl;
          devLog(`${microCMSHotel.hotelName}: 楽天API画像を使用 (roomImageUrl) -> ${hotelImage}`);
        } else if (matchedRakutenHotel.roomThumbnailUrl) {
          hotelImage = matchedRakutenHotel.roomThumbnailUrl;
          devLog(`${microCMSHotel.hotelName}: 楽天API画像を使用 (roomThumbnailUrl) -> ${hotelImage}`);
        } else {
          devLog(`${microCMSHotel.hotelName}: 楽天APIに画像がありません、デフォルト画像を使用`);
        }
      }
    } else {
      // エリア内でマッチなし → キーワード検索（同名マッチのみ採用）
      // キャッシュにある場合はそれ、無ければその場で取得を試みる（最大2秒タイムアウト）
      let kw = rakutenMatchCache.get(microCMSHotel.hotelName);
      if (!kw && !manualImage) {
        kw = (await withTimeout(getRakutenMatchByName(microCMSHotel.hotelName), 2000, null)) ?? undefined;
      }
      if (kw && !kw.missing && kw.image) {
        if (!manualImage) hotelImage = kw.image;
        if (kw.reviewAverage && !reviewAverage) reviewAverage = kw.reviewAverage;
        if (kw.reviewCount && !reviewCount) reviewCount = kw.reviewCount;
        if (kw.latitude && !latitude) latitude = kw.latitude;
        if (kw.longitude && !longitude) longitude = kw.longitude;
      }
      // それでも画像が見つからなければ PLACEHOLDER_IMAGE のまま
    }
  }
  
  // 楽天APIから価格が取得できた場合はそれを使用、できなかった場合はmicroCMSの料金計算
  if (rakutenPrice) {
    price = rakutenPrice;
    devLog(`${microCMSHotel.hotelName}: 楽天API価格 ¥${price.toLocaleString()}`);
  } else {
    // microCMSの料金計算（従来通り）
    const dogFeeText = microCMSHotel.smallDogFee || microCMSHotel.mediumDogFee || microCMSHotel.largeDogFee;
    
    // 犬の料金から追加料金を抽出（簡易的な処理）
    if (dogFeeText) {
      const priceMatch = dogFeeText.match(/(\d+)/);
      if (priceMatch) {
        price += parseInt(priceMatch[1]);
      }
    }
    devLog(`${microCMSHotel.hotelName}: microCMS計算価格 ¥${price.toLocaleString()}`);
  }

  // 座標: 楽天で取得できていれば実座標、なければ都道府県+ホテルID で散らす
  const coordinates: [number, number] = (latitude && longitude)
    ? [latitude, longitude]
    : generateCoordinates(microCMSHotel.prefecture, microCMSHotel.id);

  return {
    id: microCMSHotel.id,
    name: microCMSHotel.hotelName,
    location: `${microCMSHotel.prefecture} ${microCMSHotel.address}`,
    price: price,
    amenities: amenities,
    image: hotelImage,
    coordinates,
    reviewAverage,
    reviewCount,
    smallDog: microCMSHotel.smallDog,
    mediumDog: microCMSHotel.mediumDog,
    largeDog: microCMSHotel.largeDog,
  };
}

// microCMSデータを取得して変換する関数
export async function getMicroCMSHotels(
  area?: string,
  detailFilters?: DetailFilters,
  preFetchedRakutenHotels?: RakutenHotel[]
): Promise<Hotel[]> {
  try {
    devLog('microCMSからデータを取得中...');
    
    let microCMSHotels: DogHotelInfo[];
    
    if (area && area !== '全国') {
      // 特定の都道府県で検索
      microCMSHotels = await searchDogHotelsByPrefecture(area);
      // microCMSクエリが期待通り絞れていない場合の保険として、ローカルでも絞り込む
      const before = microCMSHotels.length;
      microCMSHotels = microCMSHotels.filter(h =>
        (h.prefecture || '').includes(area) || (h.address || '').includes(area)
      );
      if (before !== microCMSHotels.length) {
        devLog(`エリアフィルタ（ローカル補正）: ${before} -> ${microCMSHotels.length}件`);
      }
    } else {
      // 全てのデータを取得
      microCMSHotels = await getDogHotels();
    }

    devLog('microCMSから取得したデータ件数:', microCMSHotels.length);
    
    // 詳細条件でフィルタリング
    if (detailFilters) {
      microCMSHotels = microCMSHotels.filter(hotel => {
        if (detailFilters.dogRun && !hotel.dogRunOnSite) return false;
        if (detailFilters.smallDog && !hotel.smallDog) return false;
        if (detailFilters.mediumDog && !hotel.mediumDog) return false;
        if (detailFilters.largeDog && !hotel.largeDog) return false;
        if (detailFilters.roomDining && !hotel.diningWithDog) return false;
        if (detailFilters.hotSpring && !hotel.hotSpring) return false;
        if (detailFilters.parking && !hotel.parking) return false;
        if (detailFilters.multipleDogs && !hotel.multipleDogs) return false;
        if (detailFilters.petAmenities && hotel.petAmenities === '無') return false;
        if (detailFilters.dogMenu && !hotel.dogMenu) return false;
        if (detailFilters.privateBath && !hotel.privateOnsenRoom) return false;
        if (detailFilters.roomDogRun && !hotel.roomDogRun) return false;
        if (detailFilters.grooming && !hotel.groomingRoom) return false;
        if (detailFilters.leashFree && !hotel.leashFreeInside) return false;
        return true;
      });
    }
    
    // 楽天APIから価格データを取得（価格マッチング用）
    let rakutenHotels: RakutenHotel[] | undefined = preFetchedRakutenHotels;
    if (!rakutenHotels) {
      devLog('楽天APIから価格データを取得中...');
      rakutenHotels = await fetchRakutenHotels(area || '全国');
    } else {
      devLog('事前取得済みの楽天データを利用:', rakutenHotels.length, '件');
    }
    
    // キャッシュ投入は全件 非同期 (fire-and-forget) で実施。
    // レスポンスはブロックせず、初回検索は Unsplash フォールバック、
    // 2回目以降の検索でキャッシュヒットして楽天画像になる。
    const rakutenMatchedNames = new Set(
      (rakutenHotels || []).map(r => r.hotelName.toLowerCase().replace(/\s+/g, ''))
    );
    const toEnrich = microCMSHotels.filter(h => {
      const n = h.hotelName.toLowerCase().replace(/\s+/g, '');
      return !rakutenMatchedNames.has(n) && !rakutenMatchCache.has(h.hotelName);
    });
    if (toEnrich.length > 0) {
      devLog(`キーワード検索プリフェッチ(非同期): ${toEnrich.length} 件をバックグラウンド取得`);
      mapWithConcurrency(
        toEnrich,
        async (h) => {
          await withTimeout(getRakutenMatchByName(h.hotelName), 2000, null);
        },
        5
      ).catch(() => {});
    }

    // Hotel形式に変換（非同期処理）
    const hotels: Hotel[] = await Promise.all(
      microCMSHotels.map((hotel, index) => convertMicroCMSToHotel(hotel, index, rakutenHotels))
    );

    devLog('microCMSフィルタ後の件数:', hotels.length);
    return hotels;
    
  } catch (error) {
    console.error('microCMSデータ取得エラー:', error);
    return [];
  }
}

// 詳細ページ用の拡張された型定義
export interface HotelDetail extends Hotel {
  access?: string;
  checkin?: string;
  checkout?: string;
  parking?: string;
  payment?: string;
  phone?: string;
  images: string[];
  // icon はクライアント側で名前から解決する（Server → Client で関数を渡せないため）
  dogFeatures: Array<{
    name: string;
    available: boolean;
  }>;
  petInfo: {
    sizes: string;
    maxPets: string;
    petFee: string;
    amenities: string;
  };
  website?: string;
  rakutenUrl?: string;
  notes?: string;
}

// IDでホテル詳細を取得する関数
// id は microCMS レコードID or "r_<hotelNo>"（楽天）
export async function getHotelById(id: string): Promise<HotelDetail | null> {
  try {
    devLog('ホテル詳細取得 ID:', id);

    // 楽天IDの場合
    if (id.startsWith('r_')) {
      const hotelNo = id.slice(2);
      // 楽天詳細APIを試行
      const rakutenHotelDetail = await fetchRakutenHotelDetail(hotelNo);
      if (rakutenHotelDetail) {
        devLog('楽天詳細APIでホテルが見つかりました:', rakutenHotelDetail.hotelBasicInfo?.hotelName);
        return convertRakutenDetailToHotelDetail(rakutenHotelDetail, id);
      }
      // 詳細APIで見つからない場合は検索APIから
      const rakutenHotels = await fetchRakutenHotels('全国');
      if (rakutenHotels && Array.isArray(rakutenHotels)) {
        const rakutenHotel = rakutenHotels.find(h => h.hotelNo === hotelNo);
        if (rakutenHotel) {
          devLog('楽天検索APIでホテルが見つかりました:', rakutenHotel.hotelName);
          return convertRakutenToHotelDetail(rakutenHotel, id);
        }
      }
      devLog('楽天ホテルが見つかりませんでした ID:', id);
      return null;
    }

    // 1. Supabase（移行先）から取得を試みる
    const fromSupabase = await getHotelByLegacyId(id);
    if (fromSupabase) {
      devLog('Supabaseでホテルが見つかりました:', fromSupabase.hotelName);
      return await convertMicroCMSToHotelDetail(fromSupabase);
    }

    // 2. microCMSから単一レコード取得（移行漏れ・新規追加分のフォールバック）
    const direct = await getDogHotelById(id);
    if (direct) {
      devLog('microCMSでホテルが見つかりました:', direct.hotelName);
      return await convertMicroCMSToHotelDetail(direct);
    }

    // 3. フォールバック: 全件取得して find
    const microCMSHotels = await getDogHotels();
    const microCMSHotel = microCMSHotels.find(h => h.id === id);
    if (microCMSHotel) {
      devLog('microCMSでホテルが見つかりました(全件フォールバック):', microCMSHotel.hotelName);
      return await convertMicroCMSToHotelDetail(microCMSHotel);
    }

    devLog('ホテルが見つかりませんでした ID:', id);
    return null;

  } catch (error) {
    console.error('ホテル詳細取得エラー:', error);
    return null;
  }
}

// microCMSデータを詳細ページ用に変換（楽天APIの画像を優先的に利用）
async function convertMicroCMSToHotelDetail(microCMSHotel: DogHotelInfo): Promise<HotelDetail> {
  // 楽天APIから該当都道府県のデータを取得
  const rakutenHotels = await fetchRakutenHotels(microCMSHotel.prefecture || '全国');
  const baseHotel = await convertMicroCMSToHotel(microCMSHotel, 0, rakutenHotels);

  // 楽天の同名候補をマッチングして画像を収集
  let images: string[] = [];
  let rakutenUrl: string | undefined = undefined;

  // microCMS に手動入力された画像群があれば最優先でギャラリーに投入
  const manualGallery = [
    microCMSHotel.image,
    ...(microCMSHotel.images || []),
  ].filter((u): u is string => !!u);
  for (const url of manualGallery) {
    if (!images.includes(url)) images.push(url);
    if (images.length >= 5) break;
  }
  if (rakutenHotels && Array.isArray(rakutenHotels) && rakutenHotels.length > 0) {
    const normalize = (s: string) => s.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[・・]/g, '')
      .replace(/[（）()]/g, '')
      .replace(/[ホテル|旅館|リゾート|温泉]/g, '');

    // 厳格化: 完全一致 or 双方8文字以上の前方一致のみ採用
    const matched = rakutenHotels.find(r => {
      const a = normalize(microCMSHotel.hotelName || '');
      const b = normalize(r.hotelName || '');
      if (!a || !b) return false;
      if (a === b) return true;
      if (a.length >= 8 && b.length >= 8 && (a.startsWith(b) || b.startsWith(a))) return true;
      return false;
    });

    if (matched) {
      // 画像候補の優先順位: hotelImageUrl > roomImageUrl > hotelThumbnailUrl > roomThumbnailUrl > hotelMapImageUrl
      const candidates = [matched.hotelImageUrl, matched.roomImageUrl, matched.hotelThumbnailUrl, matched.roomThumbnailUrl, matched.hotelMapImageUrl]
        .filter((u): u is string => !!u && typeof u === 'string');
      for (const url of candidates) {
        if (!images.includes(url)) images.push(url);
        if (images.length >= 8) break;
      }
      // 楽天詳細APIから追加画像を取得（roomInfo / facilitiesInfo 等に画像URLが紛れている）
      if (matched.hotelNo && images.length < 8) {
        const moreUrls = await fetchRakutenHotelImages(matched.hotelNo);
        for (const u of moreUrls) {
          if (!images.includes(u)) images.push(u);
          if (images.length >= 8) break;
        }
      }
      if (!rakutenUrl) rakutenUrl = withAffiliate(matched.planListUrl || matched.dpPlanListUrl) || undefined;
    }
  }

  // 県内にマッチが無かった場合、キーワード検索でもう一度探す
  if (images.length === 0 || !rakutenUrl) {
    const kwResults = await searchRakutenByKeyword(microCMSHotel.hotelName);
    if (kwResults.length > 0) {
      // 最上位を採用（楽天のスコア順）
      const best = kwResults[0];
      const candidates = [best.hotelImageUrl, best.roomImageUrl, best.hotelThumbnailUrl, best.roomThumbnailUrl, best.hotelMapImageUrl]
        .filter((u): u is string => !!u && typeof u === 'string');
      for (const url of candidates) {
        if (!images.includes(url)) images.push(url);
        if (images.length >= 8) break;
      }
      // 同じく詳細APIから追加画像
      if (best.hotelNo && images.length < 8) {
        const moreUrls = await fetchRakutenHotelImages(best.hotelNo);
        for (const u of moreUrls) {
          if (!images.includes(u)) images.push(u);
          if (images.length >= 8) break;
        }
      }
      if (!rakutenUrl) rakutenUrl = withAffiliate(best.planListUrl || best.dpPlanListUrl) || undefined;
      devLog(`${microCMSHotel.hotelName}: キーワード検索で楽天データを取得`);
    }
  }

  // それでも楽天URLが無ければ、宿名での楽天トラベル検索URLをアフィ付きで生成
  if (!rakutenUrl) {
    rakutenUrl = buildRakutenSearchUrl(microCMSHotel.hotelName);
  }

  // 不足画像は補完しない（別宿の写真を流用しない方針）
  // 画像が0枚の場合のみプレースホルダ1枚をセット
  if (images.length === 0) {
    images.push(PLACEHOLDER_IMAGE);
  }

  return {
    ...baseHotel,
    access: microCMSHotel.access || 'アクセス情報なし',
    checkin: microCMSHotel.checkinTime || '15:00',
    checkout: microCMSHotel.checkoutTime || '10:00',
    parking: microCMSHotel.parking ? 'あり' : 'なし',
    payment: microCMSHotel.paymentInfo || '現金',
    phone: microCMSHotel.phoneNumber || '電話番号なし',
    images,
    dogFeatures: [
      { name: '小型犬OK', available: microCMSHotel.smallDog },
      { name: '中型犬OK', available: microCMSHotel.mediumDog },
      { name: '大型犬OK', available: microCMSHotel.largeDog },
      { name: '多頭OK', available: microCMSHotel.multipleDogs },
      { name: 'ドッグラン', available: microCMSHotel.dogRunOnSite },
      { name: 'お部屋にドッグラン', available: microCMSHotel.roomDogRun },
      { name: '一緒にごはんOK', available: microCMSHotel.diningWithDog },
      { name: 'ドッグメニュー', available: microCMSHotel.dogMenu },
      { name: '温泉', available: microCMSHotel.hotSpring },
      { name: '駐車場', available: microCMSHotel.parking },
    ],
    petInfo: {
      sizes: [
        microCMSHotel.smallDog && '小型犬',
        microCMSHotel.mediumDog && '中型犬', 
        microCMSHotel.largeDog && '大型犬'
      ].filter(Boolean).join('・') + 'OK',
      maxPets: microCMSHotel.multipleDogs ? '複数頭OK' : '1頭まで',
      petFee: [
        microCMSHotel.smallDogFee && `小型犬: ¥${microCMSHotel.smallDogFee}`,
        microCMSHotel.mediumDogFee && `中型犬: ¥${microCMSHotel.mediumDogFee}`,
        microCMSHotel.largeDogFee && `大型犬: ¥${microCMSHotel.largeDogFee}`
      ].filter(Boolean).join(' / ') || '料金情報なし',
      amenities: microCMSHotel.petAmenities || 'アメニティ情報なし'
    },
    website: microCMSHotel.officialWebsite,
    rakutenUrl,
    notes: microCMSHotel.otherNotes?.replace(/<[^>]*>/g, '') || '',
  };
}

// 楽天APIデータを詳細ページ用に変換
function convertRakutenToHotelDetail(rakutenHotel: RakutenHotel, requestedId?: string): HotelDetail {
  const baseHotel: Hotel = {
    id: `r_${rakutenHotel.hotelNo || '0'}`,
    name: rakutenHotel.hotelName,
    location: `${rakutenHotel.address1} ${rakutenHotel.address2}`.trim(),
    price: generatePrice(rakutenHotel.reviewAverage, rakutenHotel.hotelMinCharge),
    amenities: generateAmenities(),
    image: rakutenHotel.hotelImageUrl || '/images/画像2.jpeg',
    coordinates: (rakutenHotel.latitude && rakutenHotel.longitude)
      ? [rakutenHotel.latitude, rakutenHotel.longitude]
      : generateCoordinates(rakutenHotel.address1 || '全国', rakutenHotel.hotelNo || '0'),
    reviewAverage: rakutenHotel.reviewAverage || undefined,
    reviewCount: rakutenHotel.reviewCount || undefined,
  };

  // 楽天APIから取得できる複数の画像URLを配列として設定
  const images: string[] = [];
  
  // メイン画像
  if (rakutenHotel.hotelImageUrl) {
    images.push(rakutenHotel.hotelImageUrl);
  }
  
  // 客室画像
  if (rakutenHotel.roomImageUrl) {
    images.push(rakutenHotel.roomImageUrl);
  }
  
  // サムネイル画像（メイン画像と異なる場合のみ）
  if (rakutenHotel.hotelThumbnailUrl && rakutenHotel.hotelThumbnailUrl !== rakutenHotel.hotelImageUrl) {
    images.push(rakutenHotel.hotelThumbnailUrl);
  }
  
  // 客室サムネイル画像（他の画像と異なる場合のみ）
  if (rakutenHotel.roomThumbnailUrl && !images.includes(rakutenHotel.roomThumbnailUrl)) {
    images.push(rakutenHotel.roomThumbnailUrl);
  }
  
  // 地図画像（他の画像と異なる場合のみ）
  if (rakutenHotel.hotelMapImageUrl && !images.includes(rakutenHotel.hotelMapImageUrl)) {
    images.push(rakutenHotel.hotelMapImageUrl);
  }
  
  // 画像が無い場合のみプレースホルダ1枚（別宿の写真は流用しない）
  if (images.length === 0) {
    images.push(PLACEHOLDER_IMAGE);
  }

  return {
    ...baseHotel,
    access: rakutenHotel.access || 'アクセス情報なし',
    checkin: '15:00',
    checkout: '10:00', 
    parking: rakutenHotel.parkingInformation || '駐車場情報なし',
    payment: 'クレジットカード・現金',
    phone: rakutenHotel.telephoneNo || '電話番号なし',
    images: images, // 複数の画像URLを配列として設定
    dogFeatures: [
      { name: '小型犬OK', available: true },
      { name: '中型犬OK', available: true },
      { name: '大型犬OK', available: true },
      { name: 'ドッグラン', available: true },
      { name: '駐車場', available: true },
      { name: '温泉', available: true },
    ],
    petInfo: {
      sizes: '全サイズOK（小型犬・中型犬・大型犬）',
      maxPets: '1室につき最大3頭まで',
      petFee: '1泊1頭につき ¥3,000〜¥5,000（税込）',
      amenities: 'ペットシーツ、タオル、食器等'
    },
    website: rakutenHotel.planListUrl,
    rakutenUrl: withAffiliate(rakutenHotel.planListUrl || rakutenHotel.dpPlanListUrl) || buildRakutenSearchUrl(rakutenHotel.hotelName),
    notes: rakutenHotel.hotelComment || '',
  };
}

// 楽天詳細APIのデータを詳細ページ用に変換（新規追加）
function convertRakutenDetailToHotelDetail(rakutenDetail: any, requestedId?: string): HotelDetail {
  const basicInfo = rakutenDetail.hotelBasicInfo;
  const detailInfo = rakutenDetail.hotelDetailInfo;
  const facilitiesInfo = rakutenDetail.hotelFacilitiesInfo;
  
  const baseHotel: Hotel = {
    id: `r_${basicInfo.hotelNo || '0'}`,
    name: basicInfo.hotelName,
    location: `${basicInfo.address1} ${basicInfo.address2}`.trim(),
    price: generatePrice(basicInfo.reviewAverage || 4.0, basicInfo.hotelMinCharge),
    amenities: generateAmenities(),
    image: basicInfo.hotelImageUrl || '/images/画像2.jpeg',
    coordinates: (basicInfo.latitude && basicInfo.longitude)
      ? [basicInfo.latitude / 3600, basicInfo.longitude / 3600] // 念のため生のAPI値が来ても対応
      : generateCoordinates(basicInfo.address1 || '全国', basicInfo.hotelNo || '0'),
    reviewAverage: basicInfo.reviewAverage || undefined,
    reviewCount: basicInfo.reviewCount || undefined,
  };
  
  // 楽天詳細APIから取得できる複数の画像URLを配列として設定
  const images: string[] = [];
  
  // メイン画像
  if (basicInfo.hotelImageUrl) {
    images.push(basicInfo.hotelImageUrl);
  }
  
  // 客室画像
  if (basicInfo.roomImageUrl) {
    images.push(basicInfo.roomImageUrl);
  }
  
  // サムネイル画像（メイン画像と異なる場合のみ）
  if (basicInfo.hotelThumbnailUrl && basicInfo.hotelThumbnailUrl !== basicInfo.hotelImageUrl) {
    images.push(basicInfo.hotelThumbnailUrl);
  }
  
  // 客室サムネイル画像（他の画像と異なる場合のみ）
  if (basicInfo.roomThumbnailUrl && !images.includes(basicInfo.roomThumbnailUrl)) {
    images.push(basicInfo.roomThumbnailUrl);
  }
  
  // 地図画像（他の画像と異なる場合のみ）
  if (basicInfo.hotelMapImageUrl && !images.includes(basicInfo.hotelMapImageUrl)) {
    images.push(basicInfo.hotelMapImageUrl);
  }
  
  // 詳細APIでは更に多くの画像が取得できる可能性があります
  // （楽天APIの仕様により追加の画像フィールドがある場合）
  
  // 画像が無い場合のみプレースホルダ1枚（別宿の写真は流用しない）
  if (images.length === 0) {
    images.push(PLACEHOLDER_IMAGE);
  }
  
  // 客室設備・館内設備情報から犬対応特徴を推測
  const roomFacilities = facilitiesInfo?.roomFacilities || [];
  const hotelFacilities = facilitiesInfo?.hotelFacilities || [];
  const allFacilities = [...roomFacilities, ...hotelFacilities];
  
  const hasPetFacility = allFacilities.some(facility => 
    facility?.item?.includes('ペット') || 
    facility?.item?.includes('犬') ||
    facility?.item?.includes('愛犬')
  );
  
  const hasHotSpring = basicInfo.hotelSpecial?.includes('温泉') || 
                      detailInfo?.aboutBath?.includes('温泉') ||
                      allFacilities.some(facility => facility?.item?.includes('温泉'));
  
  const hasParking = basicInfo.parkingInformation?.includes('あり') ||
                    allFacilities.some(facility => facility?.item?.includes('駐車場'));
  
  return {
    ...baseHotel,
    access: basicInfo.access || detailInfo?.areaName || 'アクセス情報なし',
    checkin: detailInfo?.checkinTime || '15:00',
    checkout: detailInfo?.checkoutTime || '10:00', 
    parking: basicInfo.parkingInformation || (hasParking ? 'あり' : '要確認'),
    payment: '各種クレジットカード・現金',
    phone: basicInfo.telephoneNo || detailInfo?.reserveTelephoneNo || '電話番号なし',
    images: images, // 楽天詳細APIから取得した複数の画像URLを配列として設定
    dogFeatures: [
      { name: 'ペット宿泊可', available: hasPetFacility },
      { name: '小型犬OK', available: hasPetFacility },
      { name: '中型犬OK', available: hasPetFacility },
      { name: '大型犬OK', available: hasPetFacility },
      { name: '駐車場', available: hasParking },
      { name: '温泉', available: hasHotSpring },
    ],
    petInfo: {
      sizes: hasPetFacility ? '要確認（ホテルにお問い合わせください）' : 'ペット宿泊については要確認',
      maxPets: '要確認',
      petFee: '要確認（ホテルにお問い合わせください）',
      amenities: '要確認'
    },
    website: basicInfo.planListUrl || basicInfo.hotelInformationUrl,
    rakutenUrl: withAffiliate(basicInfo.planListUrl || basicInfo.dpPlanListUrl) || buildRakutenSearchUrl(basicInfo.hotelName),
    notes: basicInfo.hotelComment || detailInfo?.note || '',
  };
} 