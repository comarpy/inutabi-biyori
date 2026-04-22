import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Dog, MapPin, Search, Star } from 'lucide-react';
import { getAreaJpName, getAllAreaSlugs } from '@/lib/areaSlugs';
import { getMicroCMSHotels } from '@/lib/hotelService';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inutabi-biyori.jp';

export const revalidate = 3600;

export async function generateStaticParams() {
  return getAllAreaSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const jp = getAreaJpName(slug);
  if (!jp) return { title: 'エリアが見つかりません', robots: { index: false } };

  const title = `${jp}で愛犬と泊まれる宿・ホテル`;
  const description = `${jp}エリアで犬と一緒に泊まれる宿・ホテルを厳選してご紹介。ドッグラン付き、温泉付き、大型犬OKなど、こだわり条件で探せます。`;
  const url = `${SITE_URL}/area/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      title,
      description,
      url,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const jp = getAreaJpName(slug);
  if (!jp) notFound();

  const hotels = await getMicroCMSHotels(jp).catch(() => []);
  const topHotels = hotels.slice(0, 12);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${jp}で愛犬と泊まれる宿`,
    description: `${jp}エリアの犬と泊まれる宿・ホテル一覧`,
    url: `${SITE_URL}/area/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: topHotels.map((h, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/hotel/${h.id}`,
        name: h.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-[#FDF8F3]">
        <header className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80">
              <Dog className="w-6 h-6 mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">犬旅びより</span>
                <span className="text-xs opacity-90">- 愛犬と泊まれる宿が見つかる、旅の検索サイト</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <nav aria-label="breadcrumb" className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:underline">ホーム</Link>
            <span className="mx-2">/</span>
            <span>{jp}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold flex items-center mb-3">
            <MapPin className="w-8 h-8 mr-2 text-[#FF5A5F]" />
            {jp}で愛犬と泊まれる宿
          </h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {jp}エリアには、愛犬と一緒にくつろげる宿・ホテルが多数あります。
            ドッグラン付きの温泉旅館、ペット同伴で食事ができるレストラン付きホテル、
            大型犬OKのコテージなど、さまざまな選択肢から「犬旅びより」がセレクトしてご紹介します。
          </p>

          <Link
            href={`/search?areas=${encodeURIComponent(jp)}`}
            className="inline-flex items-center bg-[#FF5A5F] hover:bg-[#FF385C] text-white px-5 py-3 rounded-full text-sm font-semibold transition-colors mb-8"
          >
            <Search className="w-4 h-4 mr-2" />
            {jp}の宿を絞り込み検索
          </Link>

          <h2 className="text-2xl font-bold mb-4 mt-4">おすすめの宿</h2>

          {topHotels.length === 0 ? (
            <p className="text-gray-600">現在 {jp} の宿データを準備中です。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topHotels.map((h) => (
                <Link
                  key={h.id}
                  href={`/hotel/${h.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg hover:-translate-y-1 transition-all border border-gray-100"
                >
                  <div className="relative w-full h-44 bg-gray-100">
                    <Image
                      src={h.image}
                      alt={h.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-base mb-1 line-clamp-2">{h.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1 mb-2">{h.location}</p>
                    {h.reviewAverage ? (
                      <div className="flex items-center text-xs mb-2">
                        <Star className="w-3.5 h-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{h.reviewAverage.toFixed(1)}</span>
                        {h.reviewCount ? (
                          <span className="ml-1 text-gray-500">({h.reviewCount})</span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="text-[#FF5A5F] font-bold text-sm">¥{h.price.toLocaleString()}〜</span>
                      <span className="text-xs text-gray-500">詳細へ →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <section className="mt-10 bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-3 flex items-center">
              <Dog className="w-5 h-5 mr-2 text-[#FF5A5F]" />
              {jp}で犬と泊まるときのヒント
            </h2>
            <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
              <li>予約前に、同伴可能な犬のサイズ・頭数・料金を必ず確認しましょう。</li>
              <li>ワクチン接種証明書の持参を求める宿が多いです。</li>
              <li>ドッグラン付き、温泉付き、ペット同伴食事OKなど、条件で絞り込むと探しやすくなります。</li>
              <li>室内でリードを外していいかは宿ごとに違うので、事前に確認を。</li>
            </ul>
          </section>
        </main>

        <footer className="bg-[#3A3A3A] text-white mt-10">
          <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-300 text-center">
            © 2025 犬旅びより All Rights Reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
