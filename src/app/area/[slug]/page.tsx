import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Dog, Search, ChevronRight } from 'lucide-react';
import { getAreaJpName, getAllAreaSlugs } from '@/lib/areaSlugs';
import { getMicroCMSHotels } from '@/lib/hotelService';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';

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
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <SiteHeader />

        {/* Breadcrumb */}
        <nav
          aria-label="breadcrumb"
          className="max-w-5xl mx-auto px-4 md:px-8 pt-4 text-[12px] flex items-center gap-1.5"
          style={{ color: 'var(--text-soft)' }}
        >
          <Link href="/" className="hover:opacity-70">トップ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/search" className="hover:opacity-70">エリア</Link>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: 'var(--text-muted)' }}>{jp}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 pt-3 md:pt-5 pb-6 md:pb-8">
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4.5vw, 36px)',
              color: 'var(--text)',
              lineHeight: 1.3,
            }}
          >
            {jp}で愛犬と泊まれる宿
          </h1>
          <p
            className="mb-5 text-[14px] md:text-[15px]"
            style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}
          >
            {jp}エリアには、愛犬と一緒にくつろげる宿・ホテルが多数あります。
            ドッグラン付きの温泉旅館、ペット同伴で食事ができるレストラン付きホテル、
            大型犬OKのコテージなど、さまざまな選択肢から「犬旅びより」がセレクトしてご紹介します。
          </p>

          <Link
            href={`/search?areas=${encodeURIComponent(jp)}`}
            className="kt-btn kt-btn--primary inline-flex"
            style={{ padding: '12px 22px', fontSize: 14 }}
          >
            <Search className="w-4 h-4" />
            {jp}の宿を絞り込み検索
          </Link>
        </section>

        {/* Hotel cards */}
        <section className="max-w-5xl mx-auto px-4 md:px-8">
          <h2
            className="font-bold mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 3vw, 22px)',
              color: 'var(--text)',
            }}
          >
            おすすめの宿
          </h2>

          {topHotels.length === 0 ? (
            <p
              className="py-8 text-center"
              style={{
                color: 'var(--text-muted)',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-md)',
              }}
            >
              現在 {jp} の宿データを準備中です。
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topHotels.map((h) => (
                <HotelCard key={h.id} hotel={h} layout="vert" />
              ))}
            </div>
          )}
        </section>

        {/* Tips */}
        <section className="max-w-5xl mx-auto px-4 md:px-8 mt-10 md:mt-14">
          <div
            className="p-5 md:p-6"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <h2
              className="font-bold mb-3 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                color: 'var(--text)',
              }}
            >
              <Dog className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              {jp}で犬と泊まるときのヒント
            </h2>
            <ul
              className="text-[13px] space-y-2 list-disc pl-5"
              style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}
            >
              <li>予約前に、同伴可能な犬のサイズ・頭数・料金を必ず確認しましょう。</li>
              <li>ワクチン接種証明書の持参を求める宿が多いです。</li>
              <li>ドッグラン付き、温泉付き、ペット同伴食事OKなど、条件で絞り込むと探しやすくなります。</li>
              <li>室内でリードを外していいかは宿ごとに違うので、事前に確認を。</li>
            </ul>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  );
}
