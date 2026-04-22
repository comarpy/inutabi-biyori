import { notFound } from 'next/navigation';
import { getHotelById } from '@/lib/hotelService';
import { getDogHotels } from '@/lib/microcms';
import HotelDetailClient from './HotelDetailClient';

// ISR: 1時間ごとに再生成（初回アクセスでCDNキャッシュ、以降は即応答）
export const revalidate = 3600;

// ID は任意文字列（microCMS or r_<rakutenNo>）、事前生成外もISRで生成許可
export const dynamicParams = true;

// 事前生成: microCMS 全宿（楽天由来は除く）
// 空配列だとビルド時には何も生成せず、リクエスト時に生成してキャッシュ
export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  try {
    const hotels = await getDogHotels();
    return hotels.map((h) => ({ id: h.id }));
  } catch {
    return [];
  }
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  if (!hotel) notFound();
  return <HotelDetailClient hotel={hotel} />;
}
