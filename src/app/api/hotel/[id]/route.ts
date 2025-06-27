import { NextRequest, NextResponse } from 'next/server';
import { getHotelById } from '@/lib/hotelService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('ホテル詳細API呼び出し ID:', id);
    
    const hotel = await getHotelById(id);
    
    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: 'ホテルが見つかりません',
        },
        { status: 404 }
      );
    }
    
    console.log('ホテル詳細取得成功:', hotel.name);
    
    return NextResponse.json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error('ホテル詳細API エラー:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'データの取得に失敗しました',
      },
      { status: 500 }
    );
  }
} 