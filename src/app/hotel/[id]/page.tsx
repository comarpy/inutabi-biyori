import { notFound } from 'next/navigation';
import { getHotelById, getMicroCMSHotels, type Hotel, type HotelDetail } from '@/lib/hotelService';
import { getDogHotels } from '@/lib/microcms';
import HotelDetailClient from './HotelDetailClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inutabi-biyori.jp';

// ISR: 1時間ごとに再生成（初回アクセスでCDNキャッシュ、以降は即応答）
export const revalidate = 3600;

// ID は任意文字列（microCMS or r_<rakutenNo>）、事前生成外もISRで生成許可
export const dynamicParams = true;

// 事前生成: microCMS 全宿（楽天由来は除く）
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

// hotel.location を PostalAddress に分解
function buildAddress(location: string) {
  const prefecture = extractPrefecture(location);
  if (!prefecture) {
    return {
      '@type': 'PostalAddress' as const,
      addressCountry: 'JP',
      streetAddress: location,
    };
  }
  // "神奈川県 鎌倉市..." → addressRegion="神奈川県", streetAddress="鎌倉市..."
  const rest = location.slice(prefecture.length).trim();
  return {
    '@type': 'PostalAddress' as const,
    addressCountry: 'JP',
    addressRegion: prefecture,
    streetAddress: rest || undefined,
  };
}

// dogFeatures + 既存フィールドから amenityFeature 配列を生成（犬専用フィールドをカスタム定義）
function buildAmenityFeatures(hotel: HotelDetail) {
  const features: { '@type': 'LocationFeatureSpecification'; name: string; value: string | boolean }[] = [];

  // 受入可能サイズ
  const sizes = [
    hotel.smallDog && '小型',
    hotel.mediumDog && '中型',
    hotel.largeDog && '大型',
  ].filter(Boolean);
  if (sizes.length > 0) {
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'acceptedDogSize',
      value: sizes.join('・'),
    });
  }

  // 多頭飼いOKか
  const multipleDogs = hotel.dogFeatures.find((f) => f.name.includes('多頭'));
  if (multipleDogs?.available) {
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'multipleDogs',
      value: true,
    });
  }

  // ドッグラン
  const dogRun = hotel.dogFeatures.find((f) => f.name === 'ドッグラン');
  const roomDogRun = hotel.dogFeatures.find((f) => f.name.includes('客室') || f.name.includes('お部屋にドッグラン'));
  if (dogRun?.available || roomDogRun?.available) {
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'dogRunType',
      value: roomDogRun?.available ? '客室付き・敷地内' : '敷地内',
    });
  }

  // 同伴食事
  const dining = hotel.dogFeatures.find((f) => f.name.includes('ごはん') || f.name.includes('一緒'));
  const dogMenu = hotel.dogFeatures.find((f) => f.name.includes('メニュー'));
  if (dining?.available || dogMenu?.available) {
    const parts = [
      dining?.available && 'レストラン同伴可',
      dogMenu?.available && '犬用メニューあり',
    ].filter(Boolean) as string[];
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'dogDiningPolicy',
      value: parts.join('・'),
    });
  }

  // 温泉
  const onsen = hotel.dogFeatures.find((f) => f.name.includes('温泉'));
  if (onsen?.available) {
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'hotSpring',
      value: true,
    });
  }

  // 駐車場
  const parking = hotel.dogFeatures.find((f) => f.name.includes('駐車場'));
  if (parking?.available) {
    features.push({
      '@type': 'LocationFeatureSpecification',
      name: 'parking',
      value: true,
    });
  }

  return features;
}

function buildJsonLd(hotel: HotelDetail, id: string) {
  const url = `${SITE_URL}/hotel/${id}`;
  const [lat, lng] = hotel.coordinates || [];
  const description =
    hotel.notes?.slice(0, 200) ||
    `${hotel.name}は${hotel.location}にある、愛犬と泊まれる宿です。`;

  // 楽天 + OTA 5社など、外部予約リンクを potentialAction として表示
  const potentialActions = [
    hotel.rakutenUrl && {
      '@type': 'ReserveAction',
      target: hotel.rakutenUrl,
      name: '楽天トラベルで予約',
    },
    hotel.website && {
      '@type': 'ReserveAction',
      target: hotel.website,
      name: '公式サイトで予約',
    },
  ].filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    '@id': url,
    name: hotel.name,
    url,
    image: hotel.images.slice(0, 5),
    description,
    address: buildAddress(hotel.location),
    priceRange: `¥${hotel.price.toLocaleString()}〜`,
    petsAllowed: true,
    amenityFeature: buildAmenityFeatures(hotel),
  };

  if (hotel.phone && hotel.phone !== '電話番号なし') {
    jsonLd.telephone = hotel.phone;
  }
  if (typeof lat === 'number' && typeof lng === 'number') {
    jsonLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    };
  }
  if (hotel.checkin) jsonLd.checkinTime = hotel.checkin;
  if (hotel.checkout) jsonLd.checkoutTime = hotel.checkout;
  if (typeof hotel.reviewAverage === 'number' && typeof hotel.reviewCount === 'number' && hotel.reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: hotel.reviewAverage,
      reviewCount: hotel.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (potentialActions.length > 0) {
    jsonLd.potentialAction = potentialActions;
  }

  return jsonLd;
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

  const jsonLd = buildJsonLd(hotel, id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HotelDetailClient hotel={hotel} related={related} />
    </>
  );
}
