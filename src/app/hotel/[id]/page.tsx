import { notFound } from 'next/navigation';
import { getHotelById } from '@/lib/hotelService';
import HotelDetailClient from './HotelDetailClient';

// ISR: 1時間ごとに再生成（初回アクセスでCDNキャッシュ、以降は即応答）
export const revalidate = 3600;

// ID は microCMS レコードID や "r_<rakutenNo>" など任意文字列
export const dynamicParams = true;

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
