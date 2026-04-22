import { createClient } from 'microcms-js-sdk';
import { devLog, devWarn } from './logger';

// 環境変数が未設定でもアプリが動作するようにフォールバック
const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
const apiKey = process.env.MICROCMS_API_KEY;
const endpoint = process.env.MICROCMS_DOG_HOTELS_ENDPOINT || 'dog-hotels';
const microcmsAvailable = Boolean(serviceDomain && apiKey && endpoint);

// 環境変数が揃っている場合のみクライアントを作成
export const client = microcmsAvailable
  ? createClient({
      serviceDomain: serviceDomain as string,
      apiKey: apiKey as string,
    })
  : null;

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

// inutabi スキーマ → 既存DogHotelInfoへ正規化
function normalizeInutabiRecordToDogHotelInfo(record: any): DogHotelInfo {
  const toBool = (v: any): boolean => {
    if (typeof v === 'boolean') return v;
    const s = String(v || '').trim();
    return s === 'OK' || s === '有' || s === 'あり' || s === 'Yes' || s === 'yes' || s === 'true' || s === 'TRUE';
  };
  const notFalse = (v: any): boolean => {
    const s = String(v || '').trim();
    return !(s === 'NG' || s === '無' || s === 'なし' || s === 'No' || s === 'no' || s === 'false' || s === 'FALSE');
  };

  return {
    id: record.id,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    publishedAt: record.publishedAt,
    revisedAt: record.revisedAt,
    hotelName: record.name,
    officialWebsite: record.official_website,
    prefecture: record.area,
    address: record.address,
    access: record.access,
    hotelType: record.accommodation_type,
    checkinTime: record.check_in,
    checkoutTime: record.check_out,
    paymentInfo: record.payment_info,
    phoneNumber: record.phone_number,
    parking: toBool(record.parking) && notFalse(record.parking),
    shuttle: toBool(record.shuttle) && notFalse(record.shuttle),
    hotSpring: toBool(record.onsen) && notFalse(record.onsen),
    privateOnsenRoom: toBool(record.open_air_bath_room) && notFalse(record.open_air_bath_room),
    smallDog: toBool(record.small_dog),
    mediumDog: toBool(record.medium_dog),
    largeDog: toBool(record.large_dog),
    multipleDogs: toBool(record.multiple_dogs),
    dogRunOnSite: notFalse(record.dog_run_on_site),
    roomDogRun: notFalse(record.dog_run_in_room),
    petAmenities: record.pet_amenity,
    diningWithDog: toBool(record.meal_together),
    dogMenu: notFalse(record.dog_menu),
    smallDogFee: record.dog_fee_small,
    mediumDogFee: record.dog_fee_medium,
    largeDogFee: record.dog_fee_large,
    groomingRoom: notFalse(record.grooming_room),
    leashFreeInside: toBool(record.lead_ok_inside),
    otherNotes: record.other,
  } as DogHotelInfo;
}

export async function getDogHotels(): Promise<DogHotelInfo[]> {
  try {
    devLog('=== microCMS接続テスト ===');
    devLog('Service Domain:', serviceDomain || '(未設定)');
    devLog('API Key:', apiKey ? '設定済み' : '未設定');
    devLog('Endpoint:', endpoint);
    
    if (!microcmsAvailable || !client) {
      devWarn('microCMSの環境変数が未設定のため、空データでフォールバックします');
      return [];
    }
    
    const response = await client.get({
      endpoint,
      queries: {
        limit: 100, // より多くのホテルを取得
      },
    });
    
    const contents = (response as any)?.contents || [];
    devLog('取得件数:', contents.length || 0);
    return contents.map((rec: any) => normalizeInutabiRecordToDogHotelInfo(rec));
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

export async function getDogHotelById(id: string): Promise<DogHotelInfo | null> {
  try {
    if (!microcmsAvailable || !client) return null;
    const response = await client.getListDetail({ endpoint, contentId: id });
    if (!response) return null;
    return normalizeInutabiRecordToDogHotelInfo(response);
  } catch (error) {
    console.error('microCMS 単一レコード取得エラー:', error);
    return null;
  }
}

export async function searchDogHotelsByPrefecture(prefecture: string): Promise<DogHotelInfo[]> {
  try {
    if (!microcmsAvailable || !client) {
      devWarn('microCMSの環境変数が未設定のため、都道府県検索は空データでフォールバックします');
      return [];
    }
    const response = await client.get({
      endpoint,
      queries: {
        // inutabi スキーマでは area が都道府県
        filters: `area[equals]${prefecture}`,
        limit: 100,
      },
    });
    const contents = (response as any)?.contents;
    if (contents && Array.isArray(contents)) {
      return contents.map((rec: any) => normalizeInutabiRecordToDogHotelInfo(rec));
    }
    // 期待したレスポンスでない場合はフォールバック
    devWarn('microCMSレスポンスにcontentsが見つからないため全件取得にフォールバックします');
    const all = await getDogHotels();
    return all.filter((item) => {
      const pref = (item as any)?.prefecture || '';
      const addr = (item as any)?.address || '';
      return String(pref).includes(prefecture) || String(addr).includes(prefecture);
    });
  } catch (error) {
    console.error('microCMSからのデータ取得エラー:', error);
    // エラー時は全件取得→ローカルフィルタでフォールバック
    try {
      const all = await getDogHotels();
      return all.filter((item) => {
        const pref = (item as any)?.prefecture || '';
        const addr = (item as any)?.address || '';
        return String(pref).includes(prefecture) || String(addr).includes(prefecture);
      });
    } catch (e) {
      console.error('フォールバック取得にも失敗:', e);
      return [];
    }
  }
} 