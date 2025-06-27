import { fetchRakutenHotels, RakutenHotel } from './rakuten';
import { getDogHotels, searchDogHotelsByPrefecture, DogHotelInfo } from './microcms';
import { Dog, Car, Wifi, Coffee, Bath, UtensilsCrossed } from 'lucide-react';

// フロントエンドで期待される形式
export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  amenities: any[]; // LucideIconの配列
  image: string;
  coordinates: [number, number];
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

// アメニティを生成する関数
function generateAmenities(): any[] {
  return [Dog, Car, Wifi, Coffee, Bath, UtensilsCrossed];
}

// 価格を生成する関数
function generatePrice(reviewAverage: number): number {
  const basePrice = 8000;
  const multiplier = reviewAverage > 4 ? 1.5 : reviewAverage > 3 ? 1.2 : 1.0;
  return Math.floor(basePrice * multiplier);
}

export async function searchDogFriendlyHotels(
  area: string,
  dogSize?: string,
  checkinDate?: string,
  checkoutDate?: string
): Promise<Hotel[]> {
  try {
    console.log('検索パラメータ:', { area, dogSize, checkinDate, checkoutDate });
    
    // 並行してmicroCMSと楽天APIからデータを取得
    console.log('=== データ取得開始 ===');
    const [microCMSHotels, rakutenHotels] = await Promise.all([
      getMicroCMSHotels(area),
      fetchRakutenHotels(area, checkinDate, checkoutDate)
    ]);
    
    console.log('microCMSデータ件数:', microCMSHotels.length);
    
    // 楽天APIのデータをHotel形式に変換
    let rakutenHotelsConverted: Hotel[] = [];
    if (rakutenHotels && Array.isArray(rakutenHotels)) {
      console.log('楽天APIから取得したデータ件数:', rakutenHotels.length);
      rakutenHotelsConverted = rakutenHotels.map((hotel: RakutenHotel, index: number) => ({
        id: parseInt(hotel.hotelNo) || index + 1,
        name: hotel.hotelName,
        location: `${hotel.address1} ${hotel.address2}`.trim() || '場所情報なし',
        price: generatePrice(hotel.reviewAverage),
        amenities: generateAmenities(),
        image: hotel.hotelImageUrl || hotel.hotelThumbnailUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        coordinates: generateCoordinates(area, index),
      }));
    } else {
      console.log('楽天APIから有効なデータが取得できませんでした');
    }

    // microCMSと楽天APIのデータを統合
    const allHotels: Hotel[] = [...microCMSHotels, ...rakutenHotelsConverted];
    
    console.log('=== データ統合結果 ===');
    console.log('microCMS:', microCMSHotels.length, '件');
    console.log('楽天API:', rakutenHotelsConverted.length, '件');
    console.log('合計:', allHotels.length, '件');
    
    return allHotels;
  } catch (error) {
    console.error('検索エラー:', error);
    // エラー時はmicroCMSデータのみを返す
    try {
      console.log('エラー発生時のフォールバック: microCMSデータのみ取得');
      return await getMicroCMSHotels(area);
    } catch (fallbackError) {
      console.error('フォールバックも失敗:', fallbackError);
      return [];
    }
  }
}

// microCMSのデータをHotel形式に変換する関数
function convertMicroCMSToHotel(microCMSHotel: DogHotelInfo, index: number): Hotel {
  // 犬のサイズに基づいてアメニティを生成
  const amenities = [];
  if (microCMSHotel.smallDog || microCMSHotel.mediumDog || microCMSHotel.largeDog) amenities.push(Dog);
  if (microCMSHotel.parking) amenities.push(Car);
  if (microCMSHotel.hotSpring) amenities.push(Bath);
  if (microCMSHotel.diningWithDog) amenities.push(UtensilsCrossed);
  if (microCMSHotel.dogRunOnSite) amenities.push(Coffee); // ドッグランはCoffeeアイコンで代用
  amenities.push(Wifi); // 基本的にWifiは利用可能と仮定
  
  // 料金を生成（基本料金として設定）
  const basePrice = 15000; // 基本料金
  const dogFeeText = microCMSHotel.smallDogFee || microCMSHotel.mediumDogFee || microCMSHotel.largeDogFee;
  let price = basePrice;
  
  // 犬の料金から追加料金を抽出（簡易的な処理）
  if (dogFeeText) {
    const priceMatch = dogFeeText.match(/(\d+)/);
    if (priceMatch) {
      price += parseInt(priceMatch[1]);
    }
  }

  // IDを数値に変換（microCMSのIDは文字列なので）
  const numericId = microCMSHotel.id.replace(/\D/g, '');
  const id = numericId ? parseInt(numericId) : index + 1000; // 楽天APIのIDと重複しないよう1000から開始

  return {
    id: id,
    name: microCMSHotel.hotelName,
    location: `${microCMSHotel.prefecture} ${microCMSHotel.address}`,
    price: price,
    amenities: amenities,
    image: '/images/画像2.jpeg', // デフォルト画像
    coordinates: generateCoordinates(microCMSHotel.prefecture, index),
  };
}

// microCMSデータを取得して変換する関数
export async function getMicroCMSHotels(area?: string): Promise<Hotel[]> {
  try {
    console.log('microCMSからデータを取得中...');
    
    let microCMSHotels: DogHotelInfo[];
    
    if (area && area !== '全国') {
      // 特定の都道府県で検索
      microCMSHotels = await searchDogHotelsByPrefecture(area);
    } else {
      // 全てのデータを取得
      microCMSHotels = await getDogHotels();
    }
    
    console.log('microCMSから取得したデータ件数:', microCMSHotels.length);
    
    // Hotel形式に変換
    const hotels: Hotel[] = microCMSHotels.map((hotel, index) => convertMicroCMSToHotel(hotel, index));
    
    console.log('microCMS変換後の件数:', hotels.length);
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
  dogFeatures: Array<{
    name: string;
    icon: any;
    available: boolean;
  }>;
  petInfo: {
    sizes: string;
    maxPets: string;
    petFee: string;
    amenities: string;
  };
  website?: string;
  notes?: string;
}

// IDでホテル詳細を取得する関数
export async function getHotelById(id: string): Promise<HotelDetail | null> {
  try {
    console.log('ホテル詳細取得 ID:', id);
    
    // まずmicroCMSから検索
    const microCMSHotels = await getDogHotels();
    const microCMSHotel = microCMSHotels.find(hotel => {
      const numericId = hotel.id.replace(/\D/g, '');
      const hotelId = numericId ? parseInt(numericId) : 0;
      return hotelId.toString() === id || (hotelId + 1000).toString() === id;
    });
    
    if (microCMSHotel) {
      console.log('microCMSでホテルが見つかりました:', microCMSHotel.hotelName);
      return convertMicroCMSToHotelDetail(microCMSHotel);
    }
    
    // microCMSで見つからない場合は楽天APIのモックデータから検索
    console.log('楽天APIモックデータから検索中...');
    const rakutenHotels = await fetchRakutenHotels('全国');
    if (rakutenHotels && Array.isArray(rakutenHotels)) {
      const rakutenHotel = rakutenHotels.find((hotel, index) => 
        (parseInt(hotel.hotelNo) || index + 1).toString() === id
      );
      
      if (rakutenHotel) {
        console.log('楽天APIでホテルが見つかりました:', rakutenHotel.hotelName);
        return convertRakutenToHotelDetail(rakutenHotel);
      }
    }
    
    console.log('ホテルが見つかりませんでした ID:', id);
    return null;
    
  } catch (error) {
    console.error('ホテル詳細取得エラー:', error);
    return null;
  }
}

// microCMSデータを詳細ページ用に変換
function convertMicroCMSToHotelDetail(microCMSHotel: DogHotelInfo): HotelDetail {
  const baseHotel = convertMicroCMSToHotel(microCMSHotel, 0);
  
  // microCMSから画像を取得（将来的に画像フィールドが追加される可能性に対応）
  const images: string[] = [];
  
  // microCMSに画像フィールドがある場合の処理（現在は未実装だが将来対応）
  // if (microCMSHotel.hotelImages && Array.isArray(microCMSHotel.hotelImages)) {
  //   microCMSHotel.hotelImages.forEach(img => {
  //     if (img.url) images.push(img.url);
  //   });
  // }
  
  // 現在はデフォルト画像を使用
  if (images.length === 0) {
    images.push('/images/画像2.jpeg');
    // 複数のデフォルト画像を追加（バリエーションを提供）
    images.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80');
    images.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80');
  }
  
  return {
    ...baseHotel,
    access: microCMSHotel.access || 'アクセス情報なし',
    checkin: microCMSHotel.checkinTime || '15:00',
    checkout: microCMSHotel.checkoutTime || '10:00',
    parking: microCMSHotel.parking ? 'あり' : 'なし',
    payment: microCMSHotel.paymentInfo || '現金',
    phone: microCMSHotel.phoneNumber || '電話番号なし',
    images: images, // 複数の画像URLを配列として設定
    dogFeatures: [
      { name: '小型犬OK', icon: Dog, available: microCMSHotel.smallDog },
      { name: '中型犬OK', icon: Dog, available: microCMSHotel.mediumDog },
      { name: '大型犬OK', icon: Dog, available: microCMSHotel.largeDog },
      { name: '多頭OK', icon: Dog, available: microCMSHotel.multipleDogs },
      { name: 'ドッグラン', icon: Dog, available: microCMSHotel.dogRunOnSite },
      { name: 'お部屋にドッグラン', icon: Dog, available: microCMSHotel.roomDogRun },
      { name: '一緒にごはんOK', icon: UtensilsCrossed, available: microCMSHotel.diningWithDog },
      { name: 'ドッグメニュー', icon: UtensilsCrossed, available: microCMSHotel.dogMenu },
      { name: '温泉', icon: Bath, available: microCMSHotel.hotSpring },
      { name: '駐車場', icon: Car, available: microCMSHotel.parking },
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
    notes: microCMSHotel.otherNotes?.replace(/<[^>]*>/g, '') || '', // HTMLタグを削除
  };
}

// 楽天APIデータを詳細ページ用に変換
function convertRakutenToHotelDetail(rakutenHotel: RakutenHotel): HotelDetail {
  const baseHotel: Hotel = {
    id: parseInt(rakutenHotel.hotelNo) || 1,
    name: rakutenHotel.hotelName,
    location: `${rakutenHotel.address1} ${rakutenHotel.address2}`.trim(),
    price: generatePrice(rakutenHotel.reviewAverage),
    amenities: generateAmenities(),
    image: rakutenHotel.hotelImageUrl || '/images/画像2.jpeg',
    coordinates: generateCoordinates('全国', 0),
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
  
  // 画像がない場合はデフォルト画像を設定
  if (images.length === 0) {
    images.push('/images/画像2.jpeg');
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
      { name: '小型犬OK', icon: Dog, available: true },
      { name: '中型犬OK', icon: Dog, available: true },
      { name: '大型犬OK', icon: Dog, available: true },
      { name: 'ドッグラン', icon: Dog, available: true },
      { name: '駐車場', icon: Car, available: true },
      { name: '温泉', icon: Bath, available: true },
    ],
    petInfo: {
      sizes: '全サイズOK（小型犬・中型犬・大型犬）',
      maxPets: '1室につき最大3頭まで',
      petFee: '1泊1頭につき ¥3,000〜¥5,000（税込）',
      amenities: 'ペットシーツ、タオル、食器等'
    },
    website: rakutenHotel.planListUrl,
    notes: rakutenHotel.hotelComment || '',
  };
} 