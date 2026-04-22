import { devLog, devWarn } from './logger';

// 楽天アフィリエイトリンクでURLを包む
// affiliateId が設定されていなければ元URLをそのまま返す
export function withAffiliate(url: string | undefined | null): string {
  if (!url) return '';
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (!affiliateId) return url;
  // 楽天APIが affiliateId 付きで発行したトラッキングURL は二重ラップしない
  // - hb.afl.rakuten.co.jp: hgcアフィリエイトリンクビルダー経由
  // - img.travel.rakuten.co.jp/image/tr/api: SimpleHotelSearch等が返すリダイレクトURL
  if (url.includes('hb.afl.rakuten.co.jp') || url.includes('img.travel.rakuten.co.jp/image/tr/api')) {
    return url;
  }
  const encoded = encodeURIComponent(url);
  return `https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/?pc=${encoded}&m=${encoded}`;
}

// 宿名で楽天トラベルを検索するURLをアフィリエイト付きで生成
// 完全一致しなくても、ユーザーが結果から選んで予約すれば成果になる
export function buildRakutenSearchUrl(hotelName: string): string {
  const q = encodeURIComponent(hotelName);
  const base = `https://search.travel.rakuten.co.jp/ae/dsearch?f_query=${q}`;
  return withAffiliate(base);
}

export interface RakutenHotel {
  hotelNo: string;
  hotelName: string;
  planListUrl: string;
  dpPlanListUrl: string;
  reviewAverage: number;
  reviewCount: number;
  hotelImageUrl: string;
  hotelThumbnailUrl: string;
  roomImageUrl?: string;
  roomThumbnailUrl?: string;
  hotelMapImageUrl: string;
  address1: string;
  address2: string;
  telephoneNo: string;
  faxNo: string;
  access: string;
  parkingInformation: string;
  nearestStation: string;
  hotelComment: string;
  hotelMinCharge?: number; // 最低料金
  latitude?: number;
  longitude?: number;
}

// 楽天トラベル地区コードAPIから取得した正しい地区コード
const AREA_CODES: { [key: string]: { large: string; middle: string; small?: string } } = {
  '北海道': { large: 'japan', middle: 'hokkaido' },
  '東京': { large: 'japan', middle: 'kanto', small: 'tokyo' },
  '大阪': { large: 'japan', middle: 'kansai', small: 'osaka' },
  '京都': { large: 'japan', middle: 'kansai', small: 'kyoto' },
  '沖縄': { large: 'japan', middle: 'okinawa' },
  '全国': { large: 'japan', middle: 'hokkaido' }, // デフォルトで北海道
};

// 楽天トラベル地区コードAPIから正しい地区コードを取得する関数
export async function fetchAreaCodes(): Promise<any> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  
  if (!applicationId) {
    throw new Error('楽天API認証情報が設定されていません');
  }

  const url = `https://app.rakuten.co.jp/services/api/Travel/GetAreaClass/20131024?applicationId=${applicationId}&format=json`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    devLog('楽天トラベル地区コードAPI レスポンス:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('楽天トラベル地区コードAPI エラー:', error);
    return null;
  }
}

// 今日の日付を取得（2025年6月27日以降）
function getTodayDate(): string {
  const today = new Date();
  // 2025年6月27日より前の場合は、2025年6月27日を返す
  const minDate = new Date('2025-06-27');
  const actualDate = today < minDate ? minDate : today;
  
  const year = actualDate.getFullYear();
  const month = String(actualDate.getMonth() + 1).padStart(2, '0');
  const day = String(actualDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// チェックアウト日を取得（チェックイン日の翌日）
function getCheckoutDate(checkinDate: string): string {
  const checkin = new Date(checkinDate);
  checkin.setDate(checkin.getDate() + 1);
  const year = checkin.getFullYear();
  const month = String(checkin.getMonth() + 1).padStart(2, '0');
  const day = String(checkin.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 地区コード付きで段階的に試行する関数
async function tryWithAreaCode(applicationId: string, affiliateId?: string): Promise<RakutenHotel[]> {
  devLog('地区コード付きで段階的に試行中...');
  
  // 試行する地区コードの組み合わせ（より多くの地域をカバー）
  const areaCombinations = [
    // 1. 大分類のみ（全国）
    { largeClassCode: 'japan' },
    // 2. 主要地域の中分類
    { largeClassCode: 'japan', middleClassCode: 'hokkaido' },
    { largeClassCode: 'japan', middleClassCode: 'tohoku' },
    { largeClassCode: 'japan', middleClassCode: 'kanto' },
    { largeClassCode: 'japan', middleClassCode: 'koshinetsu' },
    { largeClassCode: 'japan', middleClassCode: 'tokai' },
    { largeClassCode: 'japan', middleClassCode: 'kansai' },
    { largeClassCode: 'japan', middleClassCode: 'chugoku' },
    { largeClassCode: 'japan', middleClassCode: 'shikoku' },
    { largeClassCode: 'japan', middleClassCode: 'kyushu' },
    // 3. 人気都市の詳細
    { largeClassCode: 'japan', middleClassCode: 'hokkaido', smallClassCode: 'sapporo' },
    { largeClassCode: 'japan', middleClassCode: 'kanto', smallClassCode: 'tokyo' },
    { largeClassCode: 'japan', middleClassCode: 'kansai', smallClassCode: 'kyoto' },
    { largeClassCode: 'japan', middleClassCode: 'kansai', smallClassCode: 'osaka' }
  ];

  for (let i = 0; i < areaCombinations.length; i++) {
    const combination = areaCombinations[i];
    devLog(`試行 ${i + 1}:`, combination);

    const params = new URLSearchParams({
      applicationId,
      format: 'json',
      hits: '100' // より多くの結果を取得（最大100件）
    });

    // 地区コードを個別に追加
    Object.entries(combination).forEach(([key, value]) => {
      params.append(key, value);
    });

    // アフィリエイトIDがある場合のみ追加
    if (affiliateId) {
      params.append('affiliateId', affiliateId);
    }

    const url = `https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426?${params.toString()}`;
    devLog(`試行 ${i + 1} URL:`, url);

    try {
      const response = await fetch(url);
      devLog(`試行 ${i + 1} HTTPステータス:`, response.status);
      
      const data = await response.json();
      devLog(`試行 ${i + 1} レスポンス概要:`, {
        hasError: !!data.error,
        hasHotels: !!(data.hotels && Array.isArray(data.hotels)),
        hotelCount: data.hotels ? data.hotels.length : 0
      });

      if (data.error) {
        devLog(`試行 ${i + 1} エラー:`, data.error, data.error_description);
        
        // API制限の場合はモックデータを返す
        if (data.error === 'too_many_requests') {
          devLog('API制限中のため、モックデータを返します');
          return getMockHotelData();
        }
        
        continue; // 次の組み合わせを試す
      }

      if (data.hotels && Array.isArray(data.hotels) && data.hotels.length > 0) {
        devLog(`試行 ${i + 1} 成功! ホテル数:`, data.hotels.length);
        const hotels = convertHotelData(data.hotels);
        devLog(`変換後のホテル数:`, hotels.length);
        devLog(`サンプルホテル:`, hotels[0]?.hotelName, hotels[0]?.hotelImageUrl);
        return hotels;
      } else {
        devLog(`試行 ${i + 1} ホテルなし - データ構造:`, Object.keys(data));
      }
    } catch (error) {
      devLog(`試行 ${i + 1} 例外:`, error);
    }
  }

  devLog('すべての試行が失敗しました');
  return [];
}

// 楽天 API の緯度経度は秒単位 (例: 154693) なので度に変換する
// 値が 200 を超えていれば秒、そうでなければ既に度とみなす（将来の仕様変更や他経路への保険）
function normalizeRakutenCoord(v: any): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return undefined;
  if (Math.abs(n) > 200) return n / 3600;
  return n;
}

// ホテルデータの変換を別関数に分離
function convertHotelData(hotels: any[]): RakutenHotel[] {
  return hotels.map((hotel: any) => ({
    hotelNo: hotel.hotel?.[0]?.hotelBasicInfo?.hotelNo || '',
    hotelName: hotel.hotel?.[0]?.hotelBasicInfo?.hotelName || '',
    planListUrl: hotel.hotel?.[0]?.hotelBasicInfo?.planListUrl || '',
    dpPlanListUrl: hotel.hotel?.[0]?.hotelBasicInfo?.dpPlanListUrl || '',
    reviewAverage: hotel.hotel?.[0]?.hotelBasicInfo?.reviewAverage || 0,
    reviewCount: hotel.hotel?.[0]?.hotelBasicInfo?.reviewCount || 0,
    hotelImageUrl: hotel.hotel?.[0]?.hotelBasicInfo?.hotelImageUrl || '',
    hotelThumbnailUrl: hotel.hotel?.[0]?.hotelBasicInfo?.hotelThumbnailUrl || '',
    roomImageUrl: hotel.hotel?.[0]?.hotelBasicInfo?.roomImageUrl,
    roomThumbnailUrl: hotel.hotel?.[0]?.hotelBasicInfo?.roomThumbnailUrl,
    hotelMapImageUrl: hotel.hotel?.[0]?.hotelBasicInfo?.hotelMapImageUrl || '',
    address1: hotel.hotel?.[0]?.hotelBasicInfo?.address1 || '',
    address2: hotel.hotel?.[0]?.hotelBasicInfo?.address2 || '',
    telephoneNo: hotel.hotel?.[0]?.hotelBasicInfo?.telephoneNo || '',
    faxNo: hotel.hotel?.[0]?.hotelBasicInfo?.faxNo || '',
    access: hotel.hotel?.[0]?.hotelBasicInfo?.access || '',
    parkingInformation: hotel.hotel?.[0]?.hotelBasicInfo?.parkingInformation || '',
    nearestStation: hotel.hotel?.[0]?.hotelBasicInfo?.nearestStation || '',
    hotelComment: hotel.hotel?.[0]?.hotelBasicInfo?.hotelComment || '',
    hotelMinCharge: hotel.hotel?.[0]?.hotelBasicInfo?.hotelMinCharge || undefined,
    // 楽天 API は緯度経度を "秒単位" で返すため、度に変換 (/3600)
    // 念のため: 値が 200 以上なら秒単位とみなし変換、そうでなければそのまま（度として扱う）
    latitude: normalizeRakutenCoord(hotel.hotel?.[0]?.hotelBasicInfo?.latitude),
    longitude: normalizeRakutenCoord(hotel.hotel?.[0]?.hotelBasicInfo?.longitude),
  }));
}

// API制限中に使用するモックデータ
function getMockHotelData(): RakutenHotel[] {
  devLog('モックデータを返しています（楽天API制限中）');
  return [
    {
      hotelNo: 'mock001',
      hotelName: 'サロマ湖鶴雅リゾート',
      planListUrl: 'https://travel.rakuten.co.jp/',
      dpPlanListUrl: 'https://travel.rakuten.co.jp/',
      reviewAverage: 4.5,
      reviewCount: 120,
      hotelImageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      hotelThumbnailUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      roomImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roomThumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      hotelMapImageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      address1: '北海道札幌市',
      address2: '中央区南1条西1-1-1',
      telephoneNo: '011-123-4567',
      faxNo: '011-123-4568',
      access: 'JR札幌駅から徒歩10分',
      parkingInformation: '無料駐車場50台',
      nearestStation: 'JR札幌駅',
      hotelComment: '愛犬と一緒に楽しめる温泉リゾートホテルです。ドッグランや犬用温泉も完備。',
      hotelMinCharge: 15800, // 実際の価格例
    },
    {
      hotelNo: 'mock002',
      hotelName: '定山渓鶴雅リゾートスパ森の謌',
      planListUrl: 'https://travel.rakuten.co.jp/',
      dpPlanListUrl: 'https://travel.rakuten.co.jp/',
      reviewAverage: 4.2,
      reviewCount: 85,
      hotelImageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      hotelThumbnailUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      roomImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roomThumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      hotelMapImageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      address1: '北海道函館市',
      address2: '末広町1-1',
      telephoneNo: '0138-123-4567',
      faxNo: '0138-123-4568',
      access: 'JR函館駅から徒歩15分',
      parkingInformation: '有料駐車場30台',
      nearestStation: 'JR函館駅',
      hotelComment: '函館の夜景を望むペットフレンドリーなホテル。愛犬と一緒に海辺を散歩できます。',
      hotelMinCharge: 12500, // 実際の価格例
    },
    {
      hotelNo: 'mock003',
      hotelName: '第一滝本館',
      planListUrl: 'https://travel.rakuten.co.jp/',
      dpPlanListUrl: 'https://travel.rakuten.co.jp/',
      reviewAverage: 4.7,
      reviewCount: 156,
      hotelImageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      hotelThumbnailUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      roomImageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roomThumbnailUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      hotelMapImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      address1: '長野県北佐久郡軽井沢町',
      address2: '軽井沢1-1-1',
      telephoneNo: '0267-123-4567',
      faxNo: '0267-123-4568',
      access: 'JR軽井沢駅から車で10分',
      parkingInformation: '無料駐車場100台',
      nearestStation: 'JR軽井沢駅',
      hotelComment: '軽井沢の自然に囲まれたペットリゾート。専用ドッグランと森林浴コースが人気です。',
      hotelMinCharge: 22400, // 実際の価格例
    },
    {
      hotelNo: 'mock004',
      hotelName: '湯河原温泉 犬と泊まれる宿 わんこの湯',
      planListUrl: 'https://travel.rakuten.co.jp/',
      dpPlanListUrl: 'https://travel.rakuten.co.jp/',
      reviewAverage: 4.3,
      reviewCount: 98,
      hotelImageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      hotelThumbnailUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      roomImageUrl: 'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roomThumbnailUrl: 'https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      hotelMapImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      address1: '神奈川県足柄下郡湯河原町',
      address2: '宮上1-1-1',
      telephoneNo: '0465-123-4567',
      faxNo: '0465-123-4568',
      access: 'JR湯河原駅から車で5分',
      parkingInformation: '無料駐車場40台',
      nearestStation: 'JR湯河原駅',
      hotelComment: '湯河原温泉の老舗旅館。愛犬専用の温泉もあり、一緒にリラックスできます。',
      hotelMinCharge: 18900, // 実際の価格例
    },
    {
      hotelNo: 'mock005',
      hotelName: '伊豆高原 ドッグリゾート ワンダフル',
      planListUrl: 'https://travel.rakuten.co.jp/',
      dpPlanListUrl: 'https://travel.rakuten.co.jp/',
      reviewAverage: 4.6,
      reviewCount: 203,
      hotelImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      hotelThumbnailUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      roomImageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roomThumbnailUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      hotelMapImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      address1: '静岡県伊東市',
      address2: '八幡野1-1-1',
      telephoneNo: '0557-123-4567',
      faxNo: '0557-123-4568',
      access: 'JR伊東駅から車で20分',
      parkingInformation: '無料駐車場80台',
      nearestStation: 'JR伊東駅',
      hotelComment: '伊豆高原の絶景を望むドッグリゾート。広大なドッグランとアジリティコースを完備。',
      hotelMinCharge: 25300, // 実際の価格例
    }
  ];
}

export async function fetchRakutenHotels(
  area: string, 
  checkinDate?: string, 
  checkoutDate?: string
): Promise<RakutenHotel[]> {
  devLog('楽天API呼び出し開始:', { area, checkinDate, checkoutDate });
  
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  
  if (!applicationId) {
    devLog('楽天API認証情報が設定されていません。モックデータを返します。');
    return filterHotelsByArea(getMockHotelData(), area);
  }

  try {
    // 楽天APIを試行し、失敗した場合はモックデータを返す
    devLog('楽天API呼び出しを試行中...');
    
    const hotels = await tryWithAreaCode(applicationId, affiliateId);
    
    if (hotels && hotels.length > 0) {
      devLog('楽天API成功:', hotels.length, '件');
      const filtered = filterHotelsByArea(hotels, area);
      devLog('地域フィルタ後(楽天):', filtered.length, '件 / 指定エリア:', area);
      return filtered;
    } else {
      devLog('楽天APIからデータが取得できませんでした。モックデータを返します。');
      const mockData = filterHotelsByArea(getMockHotelData(), area);
      devLog('モックデータの最初のホテル画像:', mockData[0]?.hotelImageUrl);
      return mockData;
    }
  } catch (error) {
    console.error('楽天API例外:', error);
    devLog('エラーのためモックデータを返します');
    return filterHotelsByArea(getMockHotelData(), area);
  }
}

export async function fetchRakutenHotelsByArea(area: string): Promise<RakutenHotel[]> {
  return fetchRakutenHotels(area);
}

// 楽天キーワード検索: ホテル名で探す
// KeywordHotelSearch は2文字以上の keyword を要求する
export async function searchRakutenByKeyword(keyword: string): Promise<RakutenHotel[]> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;

  if (!applicationId || !keyword || keyword.trim().length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    applicationId,
    format: 'json',
    keyword: keyword.trim(),
    hits: '5',
  });
  if (affiliateId) params.append('affiliateId', affiliateId);

  const url = `https://app.rakuten.co.jp/services/api/Travel/KeywordHotelSearch/20170426?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.error) {
      devLog('KeywordHotelSearch エラー:', data.error);
      return [];
    }
    if (data.hotels && Array.isArray(data.hotels)) {
      return convertHotelData(data.hotels);
    }
    return [];
  } catch (error) {
    console.error('KeywordHotelSearch 例外:', error);
    return [];
  }
}

// 楽天トラベルホテル詳細検索APIから詳細情報を取得する関数
export async function fetchRakutenHotelDetail(hotelNo: string): Promise<any | null> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  
  if (!applicationId) {
    devLog('楽天API認証情報が設定されていません');
    return null;
  }

  try {
    const url = `https://app.rakuten.co.jp/services/api/Travel/HotelDetailSearch/20170426?applicationId=${applicationId}&format=json&hotelNo=${hotelNo}&responseType=large`;
    
    devLog('楽天ホテル詳細API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      devLog('楽天ホテル詳細API エラー:', data.error, data.error_description);
      return null;
    }

    if (data.hotels && Array.isArray(data.hotels) && data.hotels.length > 0) {
      devLog('楽天ホテル詳細API 成功! ホテル詳細情報を取得');
      return data.hotels[0].hotel[0]; // 詳細情報を返す
    } else {
      devLog('楽天ホテル詳細API: ホテルが見つかりません');
      return null;
    }
  } catch (error) {
    console.error('楽天ホテル詳細API 例外:', error);
    return null;
  }
} 

// 指定エリア（都道府県/地方）で楽天ホテル配列をフィルタ
function filterHotelsByArea(hotels: RakutenHotel[], area: string): RakutenHotel[] {
  if (!area || area === '全国') return hotels;

  const REGION_TO_PREFS: Record<string, string[]> = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '北関東': ['茨城県', '栃木県', '群馬県'],
    '首都圏': ['埼玉県', '千葉県', '東京都', '神奈川県'],
    '甲信越': ['山梨県', '長野県', '新潟県'],
    '北陸': ['富山県', '石川県', '福井県'],
    '東海': ['岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    '沖縄': ['沖縄県'],
  };

  const targetPrefs = REGION_TO_PREFS[area] || [area];

  return hotels.filter(hotel => {
    const addr1 = hotel.address1 || '';
    const addr2 = hotel.address2 || '';
    return targetPrefs.some(pref => addr1.includes(pref) || addr2.includes(pref));
  });
}