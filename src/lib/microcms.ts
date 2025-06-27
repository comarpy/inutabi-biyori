import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
});

export interface DogHotelInfo {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  
  // 基本情報
  hotelName: string;
  officialWebsite?: string;
  prefecture: string;
  address: string;
  access?: string;
  hotelType: string;
  checkinTime?: string;
  checkoutTime?: string;
  paymentInfo?: string;
  phoneNumber?: string;
  
  // 施設情報
  parking: boolean;
  shuttle: boolean;
  hotSpring: boolean;
  privateOnsenRoom: boolean;
  
  // 犬対応情報
  smallDog: boolean;
  mediumDog: boolean;
  largeDog: boolean;
  multipleDogs: boolean;
  dogRunOnSite: boolean;
  roomDogRun: boolean;
  petAmenities?: string;
  diningWithDog: boolean;
  dogMenu: boolean;
  smallDogFee?: string;
  mediumDogFee?: string;
  largeDogFee?: string;
  groomingRoom: boolean;
  leashFreeInside: boolean;
  otherNotes?: string;
}

export async function getDogHotels(): Promise<DogHotelInfo[]> {
  try {
    console.log('=== microCMS接続テスト ===');
    console.log('Service Domain:', process.env.MICROCMS_SERVICE_DOMAIN);
    console.log('API Key:', process.env.MICROCMS_API_KEY ? '設定済み' : '未設定');
    
    const response = await client.get({
      endpoint: 'dog-hotels',
    });
    
    console.log('microCMS レスポンス:', response);
    console.log('取得件数:', response.contents?.length || 0);
    
    return response.contents || [];
  } catch (error) {
    console.error('microCMSからのデータ取得エラー:', error);
    console.error('エラー詳細:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      status: (error as any)?.status || 'Unknown status',
      statusText: (error as any)?.statusText || 'Unknown status text',
    });
    return [];
  }
}

export async function searchDogHotelsByPrefecture(prefecture: string): Promise<DogHotelInfo[]> {
  try {
    const response = await client.get({
      endpoint: 'dog-hotels',
      queries: {
        filters: `prefecture[equals]${prefecture}`,
      },
    });
    return response.contents;
  } catch (error) {
    console.error('microCMSからのデータ取得エラー:', error);
    return [];
  }
} 