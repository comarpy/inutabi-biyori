/**
 * Supabaseから1件読み出して、DogHotelInfo形式に変換できるか確認
 *   npx tsx scripts/test-supabase-read.ts [legacyId]
 */
import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { getHotelByLegacyId, listAllLegacyIds } from '../src/lib/queries/hotels';

loadEnv({ path: '.env.local' });

async function main() {
  const ids = await listAllLegacyIds();
  console.log(`📋 published宿のレガシーID: ${ids.length}件 (先頭3件: ${ids.slice(0, 3).join(', ')})`);

  const target = process.argv[2] || ids[0];
  if (!target) {
    console.error('❌ 試せるIDがありません');
    process.exit(1);
  }

  console.log(`\n🔍 ${target} を取得...`);
  const hotel = await getHotelByLegacyId(target);
  if (!hotel) {
    console.error('❌ 見つかりませんでした');
    process.exit(1);
  }

  console.log('✅ 取得成功:');
  console.log(JSON.stringify(
    {
      id: hotel.id,
      hotelName: hotel.hotelName,
      prefecture: hotel.prefecture,
      address: hotel.address,
      hotelType: hotel.hotelType,
      sizes: { S: hotel.smallDog, M: hotel.mediumDog, L: hotel.largeDog },
      multipleDogs: hotel.multipleDogs,
      amenities: {
        dogRunOnSite: hotel.dogRunOnSite,
        roomDogRun: hotel.roomDogRun,
        diningWithDog: hotel.diningWithDog,
        hotSpring: hotel.hotSpring,
        privateOnsenRoom: hotel.privateOnsenRoom,
        groomingRoom: hotel.groomingRoom,
        leashFreeInside: hotel.leashFreeInside,
        parking: hotel.parking,
      },
      lat: hotel.latitude,
      lng: hotel.longitude,
      mainImage: hotel.image ? '(あり)' : '(なし)',
      gallery: hotel.images?.length ?? 0,
      website: hotel.officialWebsite,
      access: hotel.access?.slice(0, 50),
      checkin: hotel.checkinTime,
      checkout: hotel.checkoutTime,
    },
    null,
    2,
  ));
}

main().catch((e) => { console.error(e); process.exit(1); });
