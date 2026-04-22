import type { Metadata } from "next";
import { getHotelById } from "@/lib/hotelService";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://inutabi-biyori.com";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const hotel = await getHotelById(id).catch(() => null);

  if (!hotel) {
    return {
      title: "宿が見つかりません",
      description: "指定された宿ページが見つかりませんでした。",
      robots: { index: false, follow: false },
    };
  }

  const title = `${hotel.name} - 愛犬と泊まれる宿`;
  const description = hotel.notes
    ? hotel.notes.slice(0, 140)
    : `${hotel.location}にある愛犬と泊まれる宿「${hotel.name}」。¥${hotel.price.toLocaleString()}〜/泊。`;
  const url = `${SITE_URL}/hotel/${id}`;
  const image = hotel.images?.[0] || hotel.image;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "ja_JP",
      title,
      description,
      url,
      images: image ? [{ url: image, width: 1200, height: 630, alt: hotel.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function HotelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hotel = await getHotelById(id).catch(() => null);

  const jsonLd = hotel
    ? {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        name: hotel.name,
        description: hotel.notes || undefined,
        address: hotel.location,
        telephone: hotel.phone || undefined,
        image: hotel.images || [hotel.image],
        url: `${SITE_URL}/hotel/${id}`,
        priceRange: `¥${hotel.price.toLocaleString()}〜`,
        petsAllowed: true,
        checkinTime: hotel.checkin || undefined,
        checkoutTime: hotel.checkout || undefined,
        aggregateRating: hotel.reviewAverage
          ? {
              "@type": "AggregateRating",
              ratingValue: hotel.reviewAverage,
              reviewCount: hotel.reviewCount || 1,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
