import type { ComponentType, SVGProps } from 'react';
import { fetchRakutenHotels, RakutenHotel, fetchRakutenHotelDetail, withAffiliate, searchRakutenByKeyword, buildRakutenSearchUrl } from './rakuten';
import { getDogHotels, getDogHotelById, searchDogHotelsByPrefecture, DogHotelInfo } from './microcms';
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

// 座標を生成する関数（地域に基づく）
function generateCoordinates(area: string, index: number): [number, number] {
  const baseCoordinates: { [key: string]: [number, number] } = {
    '北海道': [43.0642, 141.3469],
    '関東': [35.6762, 139.6503],
    '関西': [34.6937, 135.5023],
    '東北': [38.2682, 140.8694],
    '中部': [36.2048, 138.2529],
    '中国': [34.3853, 132.4553],
    '四国': [33.7461, 133.1053],
    '九州': [33.2382, 130.2429],
    '全国': [35.6762, 139.6503], // デフォルトは東京
  };
  
  const base = baseCoordinates[area] || baseCoordinates['全国'];
  // 少しずつ座標をずらして重複を避ける
  return [base[0] + (index * 0.01), base[1] + (index * 0.01)];
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

// ホテルIDに基づいて異なる画像セットを生成
function generateHotelImages(hotelId: string | number): string[] {
  devLog('generateHotelImages called with ID:', hotelId, 'type:', typeof hotelId);
  
  const imagePool = [
    // 犬と一緒の宿の外観
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // 客室
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // 温泉・風呂
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // レストラン・食事
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // 庭園・ドッグラン
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // 犬と自然
    'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    // 宿の施設
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
  ];

  // ホテルIDに基づいてシードを生成
  const seed = typeof hotelId === 'string' ? 
    hotelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 
    hotelId;
  
  devLog('Generated seed:', seed, 'for hotelId:', hotelId);

  // シードを使って決定論的に画像を選択
  const images: string[] = [];
  
  // 最初の画像はローカル画像
  images.push('/images/画像2.jpeg');
  
  // 残りの画像をシードに基づいて選択
  for (let i = 0; i < 4; i++) {
    const index = (seed + i * 7) % imagePool.length; // 7は素数で分散を良くする
    const selectedImage = imagePool[index];
    if (!images.includes(selectedImage)) {
      images.push(selectedImage);
    }
  }

  // 画像が5枚未満の場合は追加
  while (images.length < 5) {
    const index = (seed + images.length * 11) % imagePool.length;
    const selectedImage = imagePool[index];
    if (!images.includes(selectedImage)) {
      images.push(selectedImage);
    }
  }

  return images.slice(0, 5); // 最大5枚
}

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

    // 各エリアを完全並列化し、楽天はタイムアウト付き（1.5s）でフォールバック
    const perAreaResults = await Promise.all(
      areas.map(async (area) => {
        const rakuten = await withTimeout(
          fetchRakutenHotels(area, checkinDate, checkoutDate),
          1500,
          []
        );
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
            : generateCoordinates(areas[0] || '全国', index),
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
  
  if (rakutenHotels && Array.isArray(rakutenHotels)) {
    devLog(`${microCMSHotel.hotelName}: 楽天APIホテル数 ${rakutenHotels.length}件でマッチング試行中`);
    // ホテル名で楽天APIのデータから検索（改善されたマッチングロジック）
    const matchedRakutenHotel = rakutenHotels.find(rakutenHotel => {
      const microCMSName = microCMSHotel.hotelName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[・・]/g, '')
        .replace(/[（）()]/g, '')
        .replace(/[ホテル|旅館|リゾート|温泉]/g, '');
      const rakutenName = rakutenHotel.hotelName.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[・・]/g, '')
        .replace(/[（）()]/g, '')
        .replace(/[ホテル|旅館|リゾート|温泉]/g, '');
      
      // 完全一致
      if (microCMSName === rakutenName) return true;
      
      // 部分一致（より短い文字列での一致も含む）
      if (microCMSName.length >= 3 && rakutenName.length >= 3) {
        if (microCMSName.includes(rakutenName.substring(0, Math.min(rakutenName.length, 5))) || 
            rakutenName.includes(microCMSName.substring(0, Math.min(microCMSName.length, 5)))) {
          return true;
        }
      }
      
      // 住所での一致確認
      const microCMSAddress = microCMSHotel.address.toLowerCase().replace(/\s+/g, '');
      const rakutenAddress = `${rakutenHotel.address1}${rakutenHotel.address2}`.toLowerCase().replace(/\s+/g, '');
      
      if (microCMSAddress && rakutenAddress && (
        microCMSAddress.includes(rakutenAddress.substring(0, Math.min(rakutenAddress.length, 8))) || 
        rakutenAddress.includes(microCMSAddress.substring(0, Math.min(microCMSAddress.length, 8)))
      )) return true;
      
      return false;
    });
    
    if (matchedRakutenHotel) {
      devLog(`楽天APIでマッチしたホテル: ${microCMSHotel.hotelName} -> ${matchedRakutenHotel.hotelName}`);
      rakutenPrice = generatePrice(matchedRakutenHotel.reviewAverage, matchedRakutenHotel.hotelMinCharge);
      if (matchedRakutenHotel.reviewAverage) reviewAverage = matchedRakutenHotel.reviewAverage;
      if (matchedRakutenHotel.reviewCount) reviewCount = matchedRakutenHotel.reviewCount;
      if (matchedRakutenHotel.latitude) latitude = matchedRakutenHotel.latitude;
      if (matchedRakutenHotel.longitude) longitude = matchedRakutenHotel.longitude;
      
      // 楽天APIから画像を取得（優先順位: hotelImageUrl > hotelThumbnailUrl > roomImageUrl > roomThumbnailUrl）
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
    } else {
      // エリア内でマッチなし → キーワード検索キャッシュを確認
      const kw = rakutenMatchCache.get(microCMSHotel.hotelName);
      if (kw && !kw.missing && kw.image) {
        hotelImage = kw.image;
        if (kw.reviewAverage && !reviewAverage) reviewAverage = kw.reviewAverage;
        if (kw.reviewCount && !reviewCount) reviewCount = kw.reviewCount;
        if (kw.latitude && !latitude) latitude = kw.latitude;
        if (kw.longitude && !longitude) longitude = kw.longitude;
      } else {
        // キャッシュにない → 同エリア楽天画像プールからフォールバック
        const imagePoolFromRakuten: string[] = [];
        rakutenHotels.forEach(r => {
          if (r.hotelImageUrl) imagePoolFromRakuten.push(r.hotelImageUrl);
          if (r.roomImageUrl) imagePoolFromRakuten.push(r.roomImageUrl);
          if (r.hotelThumbnailUrl) imagePoolFromRakuten.push(r.hotelThumbnailUrl);
          if (r.roomThumbnailUrl) imagePoolFromRakuten.push(r.roomThumbnailUrl);
        });
        if (imagePoolFromRakuten.length > 0) {
          const seedStr = `${microCMSHotel.hotelName}|${microCMSHotel.address}|${microCMSHotel.id}`;
          const seed = seedStr.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
          const pick = imagePoolFromRakuten[seed % imagePoolFromRakuten.length];
          if (pick) hotelImage = pick;
        }
      }
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

  // 座標: 楽天で取得できていれば実座標、なければ生成（都道府県ベースの近似）
  const coordinates: [number, number] = (latitude && longitude)
    ? [latitude, longitude]
    : generateCoordinates(microCMSHotel.prefecture, index);

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
    
    // 楽天マッチング用にキーワード検索キャッシュを事前投入
    // 同期: 先頭30件（レスポンスブロック、予算7秒）。非同期: 残り（fire-and-forget、次回以降に反映）
    const rakutenMatchedNames = new Set(
      (rakutenHotels || []).map(r => r.hotelName.toLowerCase().replace(/\s+/g, ''))
    );
    const needsKeywordLookup = (h: DogHotelInfo) => {
      const n = h.hotelName.toLowerCase().replace(/\s+/g, '');
      return !rakutenMatchedNames.has(n) && !rakutenMatchCache.has(h.hotelName);
    };
    const prefetchSync = microCMSHotels.slice(0, 30).filter(needsKeywordLookup);
    const prefetchAsync = microCMSHotels.slice(30).filter(needsKeywordLookup);

    if (prefetchSync.length > 0) {
      devLog(`キーワード検索プリフェッチ(同期): ${prefetchSync.length} 件`);
      const budget = 7000;
      const start = Date.now();
      await mapWithConcurrency(
        prefetchSync,
        async (h) => {
          const remaining = budget - (Date.now() - start);
          if (remaining <= 200) return;
          await withTimeout(getRakutenMatchByName(h.hotelName), Math.min(1500, remaining), null);
        },
        5
      );
    }

    // 残りは非同期。次回以降の検索でキャッシュヒット
    if (prefetchAsync.length > 0) {
      devLog(`キーワード検索プリフェッチ(非同期): ${prefetchAsync.length} 件をバックグラウンドで取得`);
      mapWithConcurrency(
        prefetchAsync,
        async (h) => {
          await withTimeout(getRakutenMatchByName(h.hotelName), 2000, null);
        },
        3
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

    // microCMSから単一レコード取得（効率的）
    const direct = await getDogHotelById(id);
    if (direct) {
      devLog('microCMSでホテルが見つかりました:', direct.hotelName);
      return await convertMicroCMSToHotelDetail(direct);
    }

    // フォールバック: 全件取得して find
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
  if (rakutenHotels && Array.isArray(rakutenHotels) && rakutenHotels.length > 0) {
    const normalize = (s: string) => s.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[・・]/g, '')
      .replace(/[（）()]/g, '')
      .replace(/[ホテル|旅館|リゾート|温泉]/g, '');

    const matched = rakutenHotels.find(r => {
      const a = normalize(microCMSHotel.hotelName || '');
      const b = normalize(r.hotelName || '');
      if (a && b && a === b) return true;
      if (a.length >= 3 && b.length >= 3) {
        return a.includes(b.substring(0, Math.min(b.length, 5))) || b.includes(a.substring(0, Math.min(a.length, 5)));
      }
      const addrA = (microCMSHotel.address || '').toLowerCase().replace(/\s+/g, '');
      const addrB = `${r.address1 || ''}${r.address2 || ''}`.toLowerCase().replace(/\s+/g, '');
      return !!addrA && !!addrB && (
        addrA.includes(addrB.substring(0, Math.min(addrB.length, 8))) ||
        addrB.includes(addrA.substring(0, Math.min(addrA.length, 8)))
      );
    });

    if (matched) {
      // 画像候補の優先順位: hotelImageUrl > roomImageUrl > hotelThumbnailUrl > roomThumbnailUrl > hotelMapImageUrl
      const candidates = [matched.hotelImageUrl, matched.roomImageUrl, matched.hotelThumbnailUrl, matched.roomThumbnailUrl, matched.hotelMapImageUrl]
        .filter((u): u is string => !!u && typeof u === 'string');
      for (const url of candidates) {
        if (!images.includes(url)) images.push(url);
        if (images.length >= 5) break;
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
        if (images.length >= 5) break;
      }
      if (!rakutenUrl) rakutenUrl = withAffiliate(best.planListUrl || best.dpPlanListUrl) || undefined;
      devLog(`${microCMSHotel.hotelName}: キーワード検索で楽天データを取得`);
    }
  }

  // それでも楽天URLが無ければ、宿名での楽天トラベル検索URLをアフィ付きで生成
  if (!rakutenUrl) {
    rakutenUrl = buildRakutenSearchUrl(microCMSHotel.hotelName);
  }

  // 足りない分は決定論的な生成画像で補完
  if (images.length < 5) {
    const generated = generateHotelImages(microCMSHotel.id);
    for (const g of generated) {
      if (!images.includes(g)) images.push(g);
      if (images.length >= 5) break;
    }
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
    coordinates: generateCoordinates('全国', 0),
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
  
  // 画像がない場合はホテルIDに基づいて画像を生成
  const imageGenerationId = requestedId || rakutenHotel.hotelNo;
  if (images.length === 0) {
    const generatedImages = generateHotelImages(imageGenerationId);
    images.push(...generatedImages);
  } else if (images.length < 4) {
    // 画像が4枚未満の場合、ホテルIDに基づいて追加画像を生成
    const generatedImages = generateHotelImages(imageGenerationId);
    const additionalImages = generatedImages.filter(img => !images.includes(img));
    
    for (const img of additionalImages) {
      if (images.length >= 5) break;
      images.push(img);
    }
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
    coordinates: generateCoordinates('全国', 0),
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
  
  // 画像がない場合はホテルIDに基づいて画像を生成
  const imageGenerationId = requestedId || basicInfo.hotelNo;
  if (images.length === 0) {
    const generatedImages = generateHotelImages(imageGenerationId);
    images.push(...generatedImages);
  } else if (images.length < 4) {
    // 画像が4枚未満の場合、ホテルIDに基づいて追加画像を生成
    const generatedImages = generateHotelImages(imageGenerationId);
    const additionalImages = generatedImages.filter(img => !images.includes(img));
    
    for (const img of additionalImages) {
      if (images.length >= 5) break;
      images.push(img);
    }
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