import { NextRequest, NextResponse } from 'next/server';
import { searchDogFriendlyHotels, type DetailFilters } from '@/lib/hotelService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const area = searchParams.get('area') || '全国';
    const dogSize = searchParams.get('dogSize') || '指定なし';
    const checkinDate = searchParams.get('checkinDate') || undefined;
    const checkoutDate = searchParams.get('checkoutDate') || undefined;
    
    // 詳細条件を取得
    const detailFilters = {
      dogRun: searchParams.get('dogRun') === 'true',
      largeDog: searchParams.get('largeDog') === 'true',
      roomDining: searchParams.get('roomDining') === 'true',
      hotSpring: searchParams.get('hotSpring') === 'true',
      parking: searchParams.get('parking') === 'true',
      multipleDogs: searchParams.get('multipleDogs') === 'true'
    };

    console.log('検索パラメータ:', { area, dogSize, checkinDate, checkoutDate, detailFilters });

    const hotels = await searchDogFriendlyHotels(area, dogSize, checkinDate, checkoutDate, detailFilters);

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