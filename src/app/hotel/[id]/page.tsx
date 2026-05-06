import { notFound } from 'next/navigation';
import { getHotelById, getMicroCMSHotels, type Hotel } from '@/lib/hotelService';
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

// hotel.location ("神奈川県 鎌倉...") から都道府県を抽出
function extractPrefecture(location: string): string | null {
  const match = location.match(/^(\S+?[都道府県])/);
  return match ? match[1] : null;
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  if (!hotel) notFound();

  // 同じ都道府県の他の宿を3件取得（「近くの犬OK宿」用）
  let related: Hotel[] = [];
  const prefecture = extractPrefecture(hotel.location);
  if (prefecture) {
    const sameArea = await getMicroCMSHotels(prefecture).catch(() => [] as Hotel[]);
    related = sameArea.filter((h) => h.id !== hotel.id).slice(0, 3);
  }

  return <HotelDetailClient hotel={hotel} related={related} />;
}
