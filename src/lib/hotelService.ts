import { fetchRakutenHotels, RakutenHotel, fetchRakutenHotelDetail } from './rakuten';
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
  console.log('generateHotelImages called with ID:', hotelId, 'type:', typeof hotelId);
  
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
  
  console.log('Generated seed:', seed, 'for hotelId:', hotelId);

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
  largeDog?: boolean;
  roomDining?: boolean;
  hotSpring?: boolean;
  parking?: boolean;
  multipleDogs?: boolean;
}

export async function searchDogFriendlyHotels(
  area: string,
  dogSize?: string,
  checkinDate?: string,
  checkoutDate?: string,
  detailFilters?: DetailFilters
): Promise<Hotel[]> {
  try {
    console.log('検索パラメータ:', { area, dogSize, checkinDate, checkoutDate, detailFilters });
    
    // 並行してmicroCMSと楽天APIからデータを取得
    console.log('=== データ取得開始 ===');
    const [microCMSHotels, rakutenHotels] = await Promise.all([
      getMicroCMSHotels(area, detailFilters),
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
        price: generatePrice(hotel.reviewAverage, hotel.hotelMinCharge),
        amenities: generateAmenities(),
        image: hotel.hotelImageUrl || hotel.hotelThumbnailUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
        coordinates: generateCoordinates(area, index),
      }));
    } else {
      console.log('楽天APIから有効なデータが取得できませんでした');
    }

    // microCMSと楽天APIのデータを統合
    let allHotels: Hotel[] = [...microCMSHotels, ...rakutenHotelsConverted];
    
    // 詳細条件でフィルタリング（楽天APIのデータに対して）
    if (detailFilters) {
      // 楽天APIデータに対する簡易的なフィルタリング
      // （実際のプロダクションでは、各ホテルの詳細情報を確認する必要があります）
      allHotels = allHotels.filter(hotel => {
        // 楽天APIデータの場合は、名前や説明文から推測
        const hotelName = hotel.name.toLowerCase();
        const hotelLocation = hotel.location.toLowerCase();
        
        if (detailFilters.hotSpring && !(
          hotelName.includes('温泉') || 
          hotelName.includes('湯') ||
          hotelLocation.includes('温泉')
        )) return false;
        
        if (detailFilters.parking && !(
          hotelName.includes('駐車場') ||
          hotelLocation.includes('駐車場') ||
          hotel.id > 1000 // microCMSデータは通過
        )) return false;
        
        return true;
      });
    }
    
    console.log('=== データ統合結果 ===');
    console.log('microCMS:', microCMSHotels.length, '件');
    console.log('楽天API:', rakutenHotelsConverted.length, '件');
    console.log('フィルタ後合計:', allHotels.length, '件');
    
    return allHotels;
  } catch (error) {
    console.error('検索エラー:', error);
    // エラー時はmicroCMSデータのみを返す
    try {
      console.log('エラー発生時のフォールバック: microCMSデータのみ取得');
      return await getMicroCMSHotels(area, detailFilters);
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
export async function getMicroCMSHotels(area?: string, detailFilters?: DetailFilters): Promise<Hotel[]> {
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
    
    // 詳細条件でフィルタリング
    if (detailFilters) {
      microCMSHotels = microCMSHotels.filter(hotel => {
        if (detailFilters.dogRun && !hotel.dogRunOnSite) return false;
        if (detailFilters.largeDog && !hotel.largeDog) return false;
        if (detailFilters.roomDining && !hotel.diningWithDog) return false;
        if (detailFilters.hotSpring && !hotel.hotSpring) return false;
        if (detailFilters.parking && !hotel.parking) return false;
        if (detailFilters.multipleDogs && !hotel.multipleDogs) return false;
        return true;
      });
    }
    
    // Hotel形式に変換
    const hotels: Hotel[] = microCMSHotels.map((hotel, index) => convertMicroCMSToHotel(hotel, index));
    
    console.log('microCMSフィルタ後の件数:', hotels.length);
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
    
    // microCMSで見つからない場合は楽天APIから検索
    console.log('楽天APIから検索中...');
    
    // 楽天APIのホテル詳細情報を直接取得を試行
    const rakutenHotelDetail = await fetchRakutenHotelDetail(id);
    if (rakutenHotelDetail) {
      console.log('楽天詳細APIでホテルが見つかりました:', rakutenHotelDetail.hotelBasicInfo?.hotelName);
      return convertRakutenDetailToHotelDetail(rakutenHotelDetail, id);
    }
    
    // 詳細APIで見つからない場合は通常の検索APIから検索
    const rakutenHotels = await fetchRakutenHotels('全国');
    if (rakutenHotels && Array.isArray(rakutenHotels)) {
      const rakutenHotel = rakutenHotels.find((hotel, index) => 
        (parseInt(hotel.hotelNo) || index + 1).toString() === id
      );
      
      if (rakutenHotel) {
        console.log('楽天APIでホテルが見つかりました:', rakutenHotel.hotelName);
        return convertRakutenToHotelDetail(rakutenHotel, id);
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
  
  // 現在はホテルIDに基づいて画像を生成
  if (images.length === 0) {
    const generatedImages = generateHotelImages(microCMSHotel.id);
    images.push(...generatedImages);
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
function convertRakutenToHotelDetail(rakutenHotel: RakutenHotel, requestedId?: string): HotelDetail {
  const baseHotel: Hotel = {
    id: parseInt(rakutenHotel.hotelNo) || 1,
    name: rakutenHotel.hotelName,
    location: `${rakutenHotel.address1} ${rakutenHotel.address2}`.trim(),
    price: generatePrice(rakutenHotel.reviewAverage, rakutenHotel.hotelMinCharge),
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

// 楽天詳細APIのデータを詳細ページ用に変換（新規追加）
function convertRakutenDetailToHotelDetail(rakutenDetail: any, requestedId?: string): HotelDetail {
  const basicInfo = rakutenDetail.hotelBasicInfo;
  const detailInfo = rakutenDetail.hotelDetailInfo;
  const facilitiesInfo = rakutenDetail.hotelFacilitiesInfo;
  
  const baseHotel: Hotel = {
    id: parseInt(basicInfo.hotelNo) || 1,
    name: basicInfo.hotelName,
    location: `${basicInfo.address1} ${basicInfo.address2}`.trim(),
    price: generatePrice(basicInfo.reviewAverage || 4.0, basicInfo.hotelMinCharge),
    amenities: generateAmenities(),
    image: basicInfo.hotelImageUrl || '/images/画像2.jpeg',
    coordinates: generateCoordinates('全国', 0),
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
      { name: 'ペット宿泊可', icon: Dog, available: hasPetFacility },
      { name: '小型犬OK', icon: Dog, available: hasPetFacility },
      { name: '中型犬OK', icon: Dog, available: hasPetFacility },
      { name: '大型犬OK', icon: Dog, available: hasPetFacility },
      { name: '駐車場', icon: Car, available: hasParking },
      { name: '温泉', icon: Bath, available: hasHotSpring },
    ],
    petInfo: {
      sizes: hasPetFacility ? '要確認（ホテルにお問い合わせください）' : 'ペット宿泊については要確認',
      maxPets: '要確認',
      petFee: '要確認（ホテルにお問い合わせください）',
      amenities: '要確認'
    },
    website: basicInfo.planListUrl || basicInfo.hotelInformationUrl,
    notes: basicInfo.hotelComment || detailInfo?.note || '',
  };
} 