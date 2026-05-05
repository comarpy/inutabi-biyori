import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';
import HeroSearch from '@/components/site/HeroSearch';
import { getMicroCMSHotels } from '@/lib/hotelService';

// 1時間ごとに再生成
export const revalidate = 3600;

const REGION_SHORTCUTS: { name: string; areas: string[] }[] = [
  { name: '北海道', areas: ['北海道'] },
  { name: '東北', areas: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'] },
  { name: '関東', areas: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'] },
  { name: '甲信越', areas: ['山梨県', '長野県', '新潟県'] },
  { name: '東海', areas: ['岐阜県', '静岡県', '愛知県'] },
  { name: '近畿', areas: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'] },
  { name: '中国・四国', areas: ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'] },
  { name: '九州・沖縄', areas: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'] },
];

const ARTICLES_STUB: { title: string; tag: string; hue: number }[] = [
  { title: '箱根で大型犬と泊まれる宿5選', tag: 'エリア特集', hue: 30 },
  { title: '犬旅の持ち物チェックリスト', tag: 'ノウハウ', hue: 90 },
  { title: '車酔いしやすい子へのケア', tag: '健康', hue: 200 },
  { title: '春のおでかけ、桜の見どころ', tag: 'シーズン', hue: 350 },
];

export default async function HomePage() {
  // 編集部のおすすめ: Supabase/microCMS から先頭6件
  const allHotels = await getMicroCMSHotels().catch(() => []);
  const featured = allHotels.slice(0, 6);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader />

      {/* ============== Hero — fullbleed ============== */}
      <section
        className="relative"
        style={{
          marginBottom: 80,
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: 'clamp(360px, 60vw, 520px)',
            overflow: 'hidden',
          }}
        >
          {/* Background image */}
          <Image
            src="/images/画像2.jpeg"
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
            style={{ objectPosition: 'center 35%' }}
          />
          {/* Gradient overlay (orange/charcoal) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(166,69,0,0.78) 0%, rgba(56,38,18,0.85) 100%)',
            }}
          />
          {/* Diagonal pattern overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 18px, transparent 18px 36px)',
              mixBlendMode: 'overlay',
            }}
          />

          {/* Hero copy */}
          <div className="absolute inset-0 flex items-start">
            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 pt-8 md:pt-16 text-white">
              <div
                style={{
                  fontSize: 'clamp(11px, 1.2vw, 14px)',
                  letterSpacing: '0.18em',
                  opacity: 0.85,
                  marginBottom: 8,
                }}
              >
                FOR YOUR DOG&apos;S TRIP
              </div>
              <h1
                className="font-extrabold"
                style={{
                  fontSize: 'clamp(28px, 5.5vw, 52px)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.01em',
                  marginBottom: 12,
                }}
              >
                愛犬と、
                <br />
                最高の思い出を
              </h1>
              <p
                className="max-w-lg"
                style={{
                  fontSize: 'clamp(13px, 1.4vw, 16px)',
                  opacity: 0.92,
                  lineHeight: 1.7,
                }}
              >
                犬種・サイズ別の条件がひと目でわかる宿探しで、
                <br className="hidden md:inline" />
                家族みんなの旅を応援します
              </p>
            </div>
          </div>
        </div>

        {/* Search box pinned to bottom (overlaps hero) */}
        <div
          className="absolute left-0 right-0 px-4 md:px-8"
          style={{ bottom: '-40px' }}
        >
          <div className="max-w-4xl mx-auto">
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* ============== 編集部のおすすめ ============== */}
      <section className="px-4 md:px-8 pt-12 md:pt-20 pb-10 md:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-1">
            <h2
              className="font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3.4vw, 26px)',
                color: 'var(--text)',
              }}
            >
              編集部のおすすめ
            </h2>
            <Link
              href="/search"
              className="text-[12px] font-semibold inline-flex items-center gap-0.5"
              style={{ color: 'var(--primary)' }}
            >
              すべて見る <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[12px] mb-5" style={{ color: 'var(--text-soft)' }}>
            今シーズン注目の宿をピックアップ
          </p>

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
              現在、おすすめ宿の情報を準備中です。
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((h, i) => (
                <HotelCard key={h.id} hotel={h} layout="vert" priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============== エリアから探す (横スクロール) ============== */}
      <section
        className="py-10 md:py-12"
        style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2
            className="font-extrabold mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 3.4vw, 26px)',
              color: 'var(--text)',
            }}
          >
            エリアから探す
          </h2>
        </div>
        <div
          className="overflow-x-auto"
          style={{
            paddingLeft: 'max(1rem, calc((100vw - 80rem) / 2 + 2rem))',
            paddingRight: '1rem',
            scrollbarWidth: 'thin',
          }}
        >
          <div className="grid gap-2 md:gap-3" style={{ gridTemplateColumns: 'repeat(8, 140px)', minWidth: 'min-content' }}>
            {REGION_SHORTCUTS.map((r) => {
              const href = `/search?areas=${encodeURIComponent(r.areas.join(','))}`;
              return (
                <Link
                  key={r.name}
                  href={href}
                  className="text-center transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--r-md)',
                    padding: '16px 10px',
                    border: '1px solid var(--line)',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <div
                    className="font-bold"
                    style={{ fontSize: 14, color: 'var(--text)', fontFamily: 'var(--font-display)' }}
                  >
                    {r.name}
                  </div>
                  <div className="mt-1" style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                    {r.areas.length}都道府県
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== 読みもの (スタブ) ============== */}
      <section className="px-4 md:px-8 py-10 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-4">
            <h2
              className="font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3.4vw, 26px)',
                color: 'var(--text)',
              }}
            >
              読みもの
            </h2>
            <span className="text-[11px]" style={{ color: 'var(--text-soft)' }}>
              準備中
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ARTICLES_STUB.map((a, i) => (
              <article
                key={i}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--r-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--line)',
                  boxShadow: 'var(--sh-sm)',
                  opacity: 0.85,
                }}
              >
                <div
                  style={{
                    height: 110,
                    background: `linear-gradient(135deg, oklch(0.78 0.06 ${a.hue}) 0%, oklch(0.55 0.10 ${a.hue + 20}) 100%)`,
                  }}
                />
                <div className="p-3">
                  <span className="kt-pill kt-pill--accent" style={{ fontSize: 9 }}>
                    {a.tag}
                  </span>
                  <div
                    className="text-[12px] font-bold mt-1.5"
                    style={{ color: 'var(--text)', lineHeight: 1.5 }}
                  >
                    {a.title}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="text-[11px] mt-4 text-center" style={{ color: 'var(--text-soft)' }}>
            ※ 現在記事ページは準備中です
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
