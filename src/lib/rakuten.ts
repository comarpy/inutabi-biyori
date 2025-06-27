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
    
    console.log('楽天トラベル地区コードAPI レスポンス:', JSON.stringify(data, null, 2));
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
  console.log('地区コード付きで段階的に試行中...');
  
  // 試行する地区コードの組み合わせ（シンプルなものから）
  const areaCombinations = [
    // 1. 大分類のみ
    { largeClassCode: 'japan' },
    // 2. 大分類 + 中分類
    { largeClassCode: 'japan', middleClassCode: 'hokkaido' },
    // 3. 大分類 + 中分類 + 小分類
    { largeClassCode: 'japan', middleClassCode: 'hokkaido', smallClassCode: 'sapporo' }
  ];

  for (let i = 0; i < areaCombinations.length; i++) {
    const combination = areaCombinations[i];
    console.log(`試行 ${i + 1}:`, combination);

    const params = new URLSearchParams({
      applicationId,
      format: 'json',
      hits: '30' // より多くの結果を取得
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
    console.log(`試行 ${i + 1} URL:`, url);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.log(`試行 ${i + 1} エラー:`, data.error, data.error_description);
        
        // API制限の場合はモックデータを返す
        if (data.error === 'too_many_requests') {
          console.log('API制限中のため、モックデータを返します');
          return getMockHotelData();
        }
        
        continue; // 次の組み合わせを試す
      }

      if (data.hotels && Array.isArray(data.hotels) && data.hotels.length > 0) {
        console.log(`試行 ${i + 1} 成功! ホテル数:`, data.hotels.length);
        return convertHotelData(data.hotels);
      } else {
        console.log(`試行 ${i + 1} ホテルなし`);
      }
    } catch (error) {
      console.log(`試行 ${i + 1} 例外:`, error);
    }
  }

  console.log('すべての試行が失敗しました');
  return [];
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
  }));
}

// API制限中に使用するモックデータ
function getMockHotelData(): RakutenHotel[] {
  console.log('モックデータを返しています（楽天API制限中）');
  return [
    {
      hotelNo: 'mock001',
      hotelName: '犬と泊まれる温泉宿 ワンワンリゾート北海道',
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
    },
    {
      hotelNo: 'mock002',
      hotelName: 'ペットフレンドリーホテル 函館ベイサイド',
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
    },
    {
      hotelNo: 'mock003',
      hotelName: '愛犬と過ごす軽井沢リゾート',
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
    }
  ];
}

export async function fetchRakutenHotels(
  area: string, 
  checkinDate?: string, 
  checkoutDate?: string
): Promise<RakutenHotel[]> {
  console.log('楽天API呼び出し開始:', { area, checkinDate, checkoutDate });
  
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  
  if (!applicationId) {
    console.log('楽天API認証情報が設定されていません。モックデータを返します。');
    return getMockHotelData();
  }

  try {
    // 楽天APIの制限を考慮して、必ずモックデータを返す
    console.log('楽天API制限対策のため、モックデータを返します');
    return getMockHotelData();
    
    // 以下は実際のAPI呼び出しコード（コメントアウト）
    /*
    const hotels = await tryWithAreaCode(applicationId, affiliateId);
    
    if (hotels && hotels.length > 0) {
      console.log('楽天API成功:', hotels.length, '件');
      return hotels;
    } else {
      console.log('楽天APIからデータが取得できませんでした。モックデータを返します。');
      return getMockHotelData();
    }
    */
  } catch (error) {
    console.error('楽天API例外:', error);
    console.log('エラーのためモックデータを返します');
    return getMockHotelData();
  }
}

export async function fetchRakutenHotelsByArea(area: string): Promise<RakutenHotel[]> {
  return fetchRakutenHotels(area);
}

// 楽天トラベルホテル詳細検索APIから詳細情報を取得する関数
export async function fetchRakutenHotelDetail(hotelNo: string): Promise<any | null> {
  const applicationId = process.env.RAKUTEN_APPLICATION_ID;
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  
  if (!applicationId) {
    console.log('楽天API認証情報が設定されていません');
    return null;
  }

  try {
    const url = `https://app.rakuten.co.jp/services/api/Travel/HotelDetailSearch/20170426?applicationId=${applicationId}&format=json&hotelNo=${hotelNo}&responseType=large`;
    
    console.log('楽天ホテル詳細API URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.log('楽天ホテル詳細API エラー:', data.error, data.error_description);
      return null;
    }

    if (data.hotels && Array.isArray(data.hotels) && data.hotels.length > 0) {
      console.log('楽天ホテル詳細API 成功! ホテル詳細情報を取得');
      return data.hotels[0].hotel[0]; // 詳細情報を返す
    } else {
      console.log('楽天ホテル詳細API: ホテルが見つかりません');
      return null;
    }
  } catch (error) {
    console.error('楽天ホテル詳細API 例外:', error);
    return null;
  }
} 