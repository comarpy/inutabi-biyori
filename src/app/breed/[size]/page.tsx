import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PawPrint, ChevronRight } from 'lucide-react';
import { getMicroCMSHotels, type Hotel } from '@/lib/hotelService';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.inutabi-biyori.jp';

type SizeKey = 'small' | 'medium' | 'large';

const SIZE_MAP: Record<SizeKey, {
  label: string;
  badge: string;
  examples: string;
  weightRange: string;
  filter: (h: Hotel) => boolean;
}> = {
  small: {
    label: '小型犬',
    badge: 'BREED · SMALL',
    examples: 'チワワ・ポメラニアン・ヨーキー',
    weightRange: '〜10kg目安',
    filter: (h) => !!h.smallDog,
  },
  medium: {
    label: '中型犬',
    badge: 'BREED · MEDIUM',
    examples: '柴・ボーダーコリー・ビーグル',
    weightRange: '10〜25kg目安',
    filter: (h) => !!h.mediumDog,
  },
  large: {
    label: '大型犬',
    badge: 'BREED · LARGE',
    examples: 'ラブラドール・ゴールデン・シェパード',
    weightRange: '25kg以上目安',
    filter: (h) => !!h.largeDog,
  },
};

export const revalidate = 3600;

export function generateStaticParams() {
  return (Object.keys(SIZE_MAP) as SizeKey[]).map((size) => ({ size }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ size: string }> }
): Promise<Metadata> {
  const { size } = await params;
  const meta = SIZE_MAP[size as SizeKey];
  if (!meta) return { title: 'サイズが見つかりません', robots: { index: false } };
  const title = `${meta.label}と泊まれる宿`;
  const description = `${meta.label}(${meta.examples}など / ${meta.weightRange})と一緒に泊まれる宿・ホテルを全国から検索。`;
  const url = `${SITE_URL}/breed/${size}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', locale: 'ja_JP', title, description, url },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BreedPage({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  const meta = SIZE_MAP[size as SizeKey];
  if (!meta) notFound();

  const all = await getMicroCMSHotels().catch(() => []);
  const hotels = all.filter(meta.filter);

  // 統計
  const total = hotels.length;
  const avgPrice =
    hotels.length > 0
      ? Math.round(hotels.reduce((s, h) => s + h.price, 0) / hotels.length)
      : 0;
  const prefCounts = new Map<string, number>();
  for (const h of hotels) {
    const pref = h.location.match(/^(\S+?[都道府県])/)?.[1];
    if (pref) prefCounts.set(pref, (prefCounts.get(pref) || 0) + 1);
  }
  const popularPref = [...prefCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

  const featured = hotels.slice(0, 6);

  return (
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
        <span style={{ color: 'var(--text-muted)' }}>犬種から探す</span>
        <ChevronRight className="w-3 h-3" />
        <span style={{ color: 'var(--text)' }}>{meta.label}</span>
      </nav>

      {/* Hero */}
      <section
        className="px-4 md:px-8 py-6 md:py-10 mt-3"
        style={{ background: 'linear-gradient(135deg, var(--primary-soft), var(--surface-2))' }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4 md:gap-6">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 'clamp(80px, 14vw, 120px)',
              height: 'clamp(80px, 14vw, 120px)',
              borderRadius: '50%',
              background: 'var(--surface)',
              color: 'var(--primary)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <PawPrint style={{ width: 'clamp(36px, 7vw, 56px)', height: 'clamp(36px, 7vw, 56px)' }} />
          </div>
          <div>
            <div
              className="font-bold mb-1"
              style={{
                fontSize: 11,
                color: 'var(--primary)',
                letterSpacing: '0.1em',
              }}
            >
              {meta.badge}
            </div>
            <h1
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 4.5vw, 36px)',
                lineHeight: 1.2,
                color: 'var(--text)',
              }}
            >
              {meta.label}と泊まれる宿
            </h1>
            <p
              className="text-[12px] md:text-[13px] mt-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {meta.examples}など / {meta.weightRange}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-7">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <Stat label="全国件数" value={`${total}件`} />
          <Stat label="平均料金" value={avgPrice ? `¥${avgPrice.toLocaleString()}` : '-'} />
          <Stat label="人気エリア" value={popularPref} />
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
        <h2
          className="font-bold mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(18px, 3vw, 22px)',
            color: 'var(--text)',
          }}
        >
          {meta.label}OKの人気宿
        </h2>
        {featured.length === 0 ? (
          <p
            className="py-8 text-center text-[13px]"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
            }}
          >
            現在 {meta.label} の宿データを準備中です。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map((h) => (
              <HotelCard key={h.id} hotel={h} layout="vert" />
            ))}
          </div>
        )}
      </section>

      {/* Selection guide */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-10">
        <div
          className="p-5 md:p-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <h3
            className="font-bold mb-3"
            style={{ fontSize: 15, color: 'var(--text)' }}
          >
            {meta.label}の宿選びでチェックしたい3つのこと
          </h3>
          {[
            [
              '体重制限',
              `「${meta.label}OK」と書かれていても、宿により体重上限の規定があることがあります。${meta.weightRange}付近のワンちゃんの場合は事前確認を。`,
            ],
            [
              '客室内フリー',
              'ケージ必須かフリーかで滞在の快適度が大きく変わります。詳細ページの設備欄をチェック。',
            ],
            [
              '共用部の同伴範囲',
              'ロビー・レストラン・温泉エリアなど、犬と一緒に行動できる範囲を確認しておくと安心です。',
            ],
          ].map(([t, d], i) => (
            <div
              key={i}
              className="flex gap-3 py-3"
              style={{ borderTop: i ? '1px solid var(--line-soft)' : 'none' }}
            >
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
              <div>
                <div
                  className="text-[13px] font-bold mb-0.5"
                  style={{ color: 'var(--text)' }}
                >
                  {t}
                </div>
                <div
                  className="text-[12px]"
                  style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}
                >
                  {d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-3 md:p-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
      }}
    >
      <div className="text-[10px]" style={{ color: 'var(--text-soft)' }}>
        {label}
      </div>
      <div
        className="text-[16px] md:text-[22px] font-bold mt-1"
        style={{ color: 'var(--text)' }}
      >
        {value}
      </div>
    </div>
  );
}
