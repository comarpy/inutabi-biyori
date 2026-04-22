import { NextRequest, NextResponse } from 'next/server';
import { searchDogFriendlyHotels, type DetailFilters } from '@/lib/hotelService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const areas = searchParams.get('areas')?.split(',') || searchParams.get('area')?.split(',') || [];
    const checkinDate = searchParams.get('checkinDate') || searchParams.get('checkIn') || undefined;
    const checkoutDate = searchParams.get('checkoutDate') || searchParams.get('checkOut') || undefined;
    
    // 詳細条件を取得
    const detailFilters: DetailFilters = {
      dogRun: searchParams.get('dogRun') === 'true',
      smallDog: searchParams.get('smallDog') === 'true',
      mediumDog: searchParams.get('mediumDog') === 'true',
      largeDog: searchParams.get('largeDog') === 'true',
      roomDining: searchParams.get('roomDining') === 'true',
      hotSpring: searchParams.get('hotSpring') === 'true',
      parking: searchParams.get('parking') === 'true',
      multipleDogs: searchParams.get('multipleDogs') === 'true',
      petAmenities: searchParams.get('petAmenities') === 'true',
      dogMenu: searchParams.get('dogMenu') === 'true',
      privateBath: searchParams.get('privateBath') === 'true',
      roomDogRun: searchParams.get('roomDogRun') === 'true',
      grooming: searchParams.get('grooming') === 'true',
      leashFree: searchParams.get('leashFree') === 'true'
    };

    console.log('検索パラメータ:', { areas, checkinDate, checkoutDate, detailFilters });

    if (areas.length === 0) {
      return NextResponse.json({ success: true, hotels: [], count: 0 });
    }
    const hotels = await searchDogFriendlyHotels(areas, checkinDate, checkoutDate, detailFilters);

    console.log('検索結果:', hotels.length, '件');

    return NextResponse.json({
      success: true,
      hotels,
      count: hotels.length,
    });
  } catch (error) {
    console.error('検索API エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'データの取得に失敗しました',
        hotels: [],
        count: 0,
      },
      { status: 500 }
    );
  }
} 