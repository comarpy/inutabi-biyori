import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Dog, Search, ChevronRight } from 'lucide-react';
import { getAreaJpName, getAllAreaSlugs, AREA_SLUG_MAP } from '@/lib/areaSlugs';
import { getMicroCMSHotels } from '@/lib/hotelService';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inutabi-biyori.jp';

export const revalidate = 3600;

// 地方区分（同じ地方の他都道府県セレクタ用）
const REGIONS: { name: string; areas: string[] }[] = [
  { name: '北海道', areas: ['北海道'] },
  { name: '東北', areas: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', areas: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '甲信越', areas: ['山梨県', '長野県', '新潟県'] },
  { name: '北陸', areas: ['富山県', '石川県', '福井県'] },
  { name: '東海', areas: ['岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', areas: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国', areas: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'] },
  { name: '四国', areas: ['徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州', areas: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'] },
  { name: '沖縄', areas: ['沖縄県'] },
];

const QUICK_FILTERS: { key: string; label: string }[] = [
  { key: 'largeDog', label: '大型犬OK' },
  { key: 'multipleDogs', label: '多頭OK' },
  { key: 'dogRun', label: 'ドッグラン' },
  { key: 'hotSpring', label: '温泉' },
  { key: 'roomDining', label: '部屋食' },
  { key: 'parking', label: '駐車場' },
];

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

// 都道府県名 → slug の逆引き
function jpToSlug(jp: string): string | null {
  for (const [slug, name] of Object.entries(AREA_SLUG_MAP)) {
    if (name === jp) return slug;
  }
  return null;
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
  const PAGE_SIZE = 12;
  const visible = hotels.slice(0, PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(hotels.length / PAGE_SIZE));

  // 同地方の都道府県
  const region = REGIONS.find((r) => r.areas.includes(jp));
  const sameRegionPrefs = region ? region.areas : [jp];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${jp}で愛犬と泊まれる宿`,
    description: `${jp}エリアの犬と泊まれる宿・ホテル一覧`,
    url: `${SITE_URL}/area/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: visible.map((h, i) => ({
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
          className="max-w-7xl mx-auto px-4 md:px-8 pt-3 text-[12px] flex items-center gap-1.5"
          style={{ color: 'var(--text-soft)' }}
        >
          <Link href="/" className="hover:opacity-70">トップ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/search" className="hover:opacity-70">エリア</Link>
          {region && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-muted)' }}>{region.name}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: 'var(--text)' }}>{jp}</span>
        </nav>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pt-3 md:pt-5 pb-5 md:pb-7">
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
          <p className="text-[13px] md:text-[14px]" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {region?.name === '関東'
              ? '箱根・伊豆・那須・軽井沢など、犬連れに人気の観光地が集中。'
              : `${jp}エリアの犬連れOKの宿をセレクトしてご紹介します。`}
          </p>
        </section>

        {/* Same-region prefecture selector */}
        {sameRegionPrefs.length > 1 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 pb-5 md:pb-7">
            <div className="text-[12px] font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
              都道府県から選ぶ
            </div>
            <div
              className="grid gap-1.5"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 110px), 1fr))',
              }}
            >
              {sameRegionPrefs.map((p) => {
                const sg = jpToSlug(p);
                const isCurrent = p === jp;
                const Inner = (
                  <div
                    className="text-center py-2 px-1.5 transition-all"
                    style={{
                      background: isCurrent ? 'var(--primary-soft)' : 'var(--surface)',
                      border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--line)'}`,
                      borderRadius: 'var(--r-sm)',
                      color: isCurrent ? 'var(--primary)' : 'var(--text)',
                    }}
                  >
                    <div className="text-[12px] font-bold leading-tight">{p}</div>
                  </div>
                );
                return sg && !isCurrent ? (
                  <Link key={p} href={`/area/${sg}`} className="block">
                    {Inner}
                  </Link>
                ) : (
                  <div key={p}>{Inner}</div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick filter pills */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-3">
          <div className="flex gap-1.5 flex-wrap">
            <Link
              href={`/search?areas=${encodeURIComponent(jp)}`}
              className="kt-pill kt-pill--primary"
              style={{ fontSize: 12, padding: '6px 14px' }}
            >
              すべて
            </Link>
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.key}
                href={`/search?areas=${encodeURIComponent(jp)}&${f.key}=true`}
                className="kt-pill"
                style={{ fontSize: 12, padding: '6px 14px' }}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Result meta */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-3 flex items-center justify-between text-[12px]" style={{ color: 'var(--text-muted)' }}>
          <span>
            {hotels.length}件中 1-{Math.min(visible.length, hotels.length)}件を表示
          </span>
          <span>並び順: おすすめ ▾</span>
        </section>

        {/* Hotel cards */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          {visible.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {visible.map((h) => (
                <HotelCard key={h.id} hotel={h} layout="row" />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 mt-5 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <span
                key={p}
                className="inline-flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  background: p === 1 ? 'var(--primary)' : 'var(--surface)',
                  color: p === 1 ? 'var(--on-primary)' : 'var(--text)',
                  border: `1px solid ${p === 1 ? 'var(--primary)' : 'var(--line)'}`,
                  borderRadius: 'var(--r-sm)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {p}
              </span>
            ))}
          </section>
        )}

        {/* CTA - 詳細検索へ */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-6 md:mt-8 text-center">
          <Link
            href={`/search?areas=${encodeURIComponent(jp)}`}
            className="kt-btn kt-btn--primary inline-flex"
            style={{ padding: '12px 24px', fontSize: 14 }}
          >
            <Search className="w-4 h-4" />
            {jp}の宿を絞り込み検索
          </Link>
        </section>

        {/* Tips */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-10 md:mt-14">
          <div
            className="p-5 md:p-6"
            style={{
              background: 'var(--surface-2)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <h2
              className="font-bold mb-3 flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                color: 'var(--text)',
              }}
            >
              <Dog className="w-5 h-5" style={{ color: 'var(--primary)' }} />
              {jp}で犬と泊まる宿の選び方
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
