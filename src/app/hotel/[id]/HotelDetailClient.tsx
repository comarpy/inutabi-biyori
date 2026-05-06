'use client';

import { useState } from 'react';
import {
  Camera,
  Dog,
  Info,
  CalendarCheck,
  MapPin,
  Phone,
  Car,
  CreditCard,
  Bath,
  UtensilsCrossed,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronCrumb,
  Star,
  Check,
  Heart,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { HotelDetail, Hotel } from '@/lib/hotelService';
import { buildVcBookingLinks } from '@/lib/affiliate';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';

export default function HotelDetailClient({
  hotel,
  related,
}: {
  hotel: HotelDetail;
  related: Hotel[];
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const availableFeatures = hotel.dogFeatures.filter((f) => f.available);
  const sizeAvailable = availableFeatures.find(
    (f) => f.name.includes('大型') || f.name.includes('中型') || f.name.includes('小型')
  );
  const ota = buildVcBookingLinks(hotel.name);

  // 「料金」項目: petFee の最初のセグメント(例: "小型犬: ¥3,000")を value、残りを sub に
  const feeSegments = (hotel.petInfo.petFee || '').split('/').map((s) => s.trim()).filter(Boolean);
  const feeMain = feeSegments[0] || hotel.petInfo.petFee || '要確認';
  const feeSub = feeSegments.slice(1).join(' / ') || (feeSegments.length > 0 ? '料金は宿により変動' : '宿に直接ご確認ください');

  const featureIcon = (name: string) => {
    if (name.includes('温泉')) return Bath;
    if (name.includes('駐車場')) return Car;
    if (name.includes('ごはん') || name.includes('メニュー')) return UtensilsCrossed;
    return Dog;
  };

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
        <ChevronCrumb className="w-3 h-3" />
        <Link href="/search" className="hover:opacity-70">宿を探す</Link>
        <ChevronCrumb className="w-3 h-3" />
        <span style={{ color: 'var(--text-muted)' }} className="line-clamp-1">{hotel.name}</span>
      </nav>

      {/* Photo gallery */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-3 md:mt-4">
        {/* SP: single photo */}
        <div className="md:hidden">
          <div
            className="relative w-full overflow-hidden cursor-pointer"
            style={{
              height: 240,
              borderRadius: 'var(--r-md)',
              background: 'var(--surface-2)',
            }}
            onClick={() => setIsImageModalOpen(true)}
          >
            <Image
              src={hotel.images[0]}
              alt={hotel.name}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5"
              style={{
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                borderRadius: 'var(--r-pill)',
                fontSize: 12,
              }}
            >
              <Camera className="w-3.5 h-3.5" />
              写真 {hotel.images.length}枚
            </div>
          </div>
        </div>

        {/* PC: grid layout */}
        <div className="hidden md:grid gap-2" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '200px 200px' }}>
          <div
            className="relative cursor-pointer overflow-hidden"
            style={{
              gridRow: 'span 2',
              borderRadius: 'var(--r-md)',
              background: 'var(--surface-2)',
            }}
            onClick={() => setIsImageModalOpen(true)}
          >
            <Image
              src={hotel.images[0]}
              alt={hotel.name}
              fill
              sizes="50vw"
              priority
              className="object-cover"
            />
          </div>
          {hotel.images.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden"
              style={{
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
              }}
              onClick={() => {
                setSelectedImageIndex(i + 1);
                setIsImageModalOpen(true);
              }}
            >
              <Image
                src={img}
                alt={`${hotel.name} 写真${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover"
              />
              {i === 3 && hotel.images.length > 5 && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                >
                  <div className="text-center">
                    <Camera className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm font-medium">+ {hotel.images.length - 5}枚</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Title (PC) */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 md:px-8 mt-5">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {sizeAvailable && (
            <span className="kt-pill kt-pill--ok">
              <Check className="w-3 h-3" />
              {sizeAvailable.name}
            </span>
          )}
          {hotel.location && (
            <span className="kt-pill kt-pill--accent">
              {/* hotelType がある場合のみ表示。HotelDetail には直接の hotelType フィールドが無いため、location から推測しない */}
              旅館・ホテル
            </span>
          )}
        </div>
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            color: 'var(--text)',
            lineHeight: 1.3,
          }}
        >
          {hotel.name}
        </h1>
        <div className="flex items-center gap-4 text-[13px]" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {hotel.location}
          </span>
          {hotel.reviewAverage ? (
            <span className="flex items-center gap-1" style={{ color: 'var(--gold)', fontWeight: 700 }}>
              <Star className="w-3.5 h-3.5" style={{ fill: 'var(--gold)' }} />
              {hotel.reviewAverage.toFixed(1)}
              {hotel.reviewCount ? (
                <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>
                  ({hotel.reviewCount}件)
                </span>
              ) : null}
            </span>
          ) : null}
        </div>
      </section>

      {/* Body */}
      <section
        className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 grid gap-5 md:gap-8"
        style={{ gridTemplateColumns: '1fr' }}
      >
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-5 md:gap-8">
          {/* Left column */}
          <div>
            {/* Title (SP only) */}
            <div className="md:hidden mb-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {sizeAvailable && (
                  <span className="kt-pill kt-pill--ok">
                    <Check className="w-3 h-3" />
                    {sizeAvailable.name}
                  </span>
                )}
                <span className="kt-pill kt-pill--accent">旅館・ホテル</span>
              </div>
              <h1
                className="font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  color: 'var(--text)',
                  lineHeight: 1.3,
                }}
              >
                {hotel.name}
              </h1>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hotel.location}
                </span>
                {hotel.reviewAverage ? (
                  <span className="flex items-center gap-1" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                    <Star className="w-3 h-3" style={{ fill: 'var(--gold)' }} />
                    {hotel.reviewAverage.toFixed(1)}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Dog policy 4-grid */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Dog className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                  犬の受入れ条件
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <PolicyItem
                  label="サイズ"
                  value={hotel.petInfo.sizes}
                  sub={availableFeatures.find((f) => f.name.includes('大型')) ? '〜大型犬OK' : ''}
                />
                <PolicyItem
                  label="頭数"
                  value={hotel.petInfo.maxPets}
                  sub="1室あたり"
                />
                <PolicyItem
                  label="犬種制限"
                  value="要確認"
                  sub="ワクチン接種証明書要"
                />
                <PolicyItem
                  label="料金"
                  value={feeMain}
                  sub={feeSub}
                />
              </div>
            </Card>

            {/* Amenities */}
            {availableFeatures.length > 0 && (
              <Card>
                <h2 className="text-[14px] font-bold mb-3" style={{ color: 'var(--text)' }}>
                  犬用設備・特徴
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {availableFeatures.map((f, i) => {
                    const Icon = featureIcon(f.name);
                    return (
                      <span key={i} className="kt-pill kt-pill--ok">
                        <Icon className="w-3 h-3" />
                        {f.name}
                      </span>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* SP: Basic info card (PC は本文下に全幅) */}
            <div className="md:hidden">
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                    宿の基本情報
                  </h2>
                </div>
                <div
                  className="grid gap-y-3 gap-x-4 text-[13px]"
                  style={{ gridTemplateColumns: '110px 1fr' }}
                >
                  <Row label="住所" value={hotel.location} />
                  <Row label="アクセス" value={hotel.access || '情報なし'} />
                  <Row label="チェックイン / アウト" value={`${hotel.checkin} / ${hotel.checkout}`} />
                  <Row
                    label="駐車場"
                    value={
                      <span className="flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" style={{ color: 'var(--text-soft)' }} />
                        {hotel.parking}
                      </span>
                    }
                  />
                  <Row
                    label="決済情報"
                    value={
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5" style={{ color: 'var(--text-soft)' }} />
                        {hotel.payment}
                      </span>
                    }
                  />
                  <Row
                    label="電話番号"
                    value={
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" style={{ color: 'var(--text-soft)' }} />
                        {hotel.phone}
                      </span>
                    }
                  />
                </div>
              </Card>
            </div>

            {/* Notes */}
            {hotel.notes && (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  <h2 className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>
                    注意事項・その他
                  </h2>
                </div>
                <p className="text-[13px]" style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                  {hotel.notes}
                </p>
              </Card>
            )}
          </div>

          {/* Sticky booking sidebar */}
          <div className="md:sticky md:top-5 self-start">
            <div
              className="p-4 md:p-5"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                boxShadow: 'var(--sh-md)',
              }}
            >
              <div className="text-[11px]" style={{ color: 'var(--text-soft)' }}>
                1泊2食 / 2名利用
              </div>
              <div className="text-[26px] font-bold leading-tight mb-1" style={{ color: 'var(--primary)' }}>
                ¥{hotel.price.toLocaleString()}〜
              </div>
              <div className="text-[11px] mb-3" style={{ color: 'var(--text-soft)' }}>
                + 犬料金: {feeMain}
              </div>

              {hotel.rakutenUrl ? (
                <a
                  href={hotel.rakutenUrl}
                  target="_blank"
                  rel="nofollow noopener noreferrer sponsored"
                  className="kt-btn kt-btn--primary w-full mb-2"
                  style={{ padding: '12px 16px', fontSize: 14 }}
                >
                  楽天トラベルで予約 <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  disabled
                  className="kt-btn kt-btn--ghost w-full mb-2"
                  style={{ padding: '12px 16px', fontSize: 14 }}
                  title="現在この宿の楽天リンクは準備中です"
                >
                  楽天トラベル: 準備中
                </button>
              )}

              <div className="grid grid-cols-1 gap-2">
                {ota.map((link) => (
                  <a
                    key={link.provider}
                    href={link.url}
                    target="_blank"
                    rel="nofollow noopener noreferrer sponsored"
                    className="kt-btn kt-btn--ghost w-full"
                    style={{ padding: '10px 14px', fontSize: 13, justifyContent: 'space-between' }}
                  >
                    <span>{link.label}で予約</span>
                    <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-soft)' }} />
                  </a>
                ))}
              </div>

              {hotel.website && (
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kt-btn kt-btn--ghost w-full mt-2"
                  style={{ padding: '10px 14px', fontSize: 13, justifyContent: 'space-between' }}
                >
                  <span>公式サイトで予約</span>
                  <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-soft)' }} />
                </a>
              )}

              <div
                className="flex gap-2 mt-3 pt-3"
                style={{ borderTop: '1px solid var(--line-soft)' }}
              >
                <button
                  className="kt-btn kt-btn--ghost flex-1"
                  style={{ padding: '8px', fontSize: 11 }}
                  type="button"
                >
                  <Heart className="w-3.5 h-3.5" />
                  お気に入り
                </button>
                <button
                  className="kt-btn kt-btn--ghost flex-1"
                  style={{ padding: '8px', fontSize: 11 }}
                  type="button"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  比較に追加
                </button>
              </div>

              <p className="text-[10px] mt-3 leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                各サイトを宿名で検索するリンクです。当サイトはアフィリエイトリンクで運営されています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PC: full-width Basic Info */}
      <section className="hidden md:block max-w-7xl mx-auto px-4 md:px-8 pb-6">
        <div
          className="p-6"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <h2 className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
              宿の基本情報
            </h2>
          </div>
          <div
            className="grid gap-y-4 gap-x-6 text-[13px]"
            style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}
          >
            {[
              ['宿タイプ', '旅館・ホテル'],
              ['チェックイン', hotel.checkin || '15:00'],
              ['チェックアウト', hotel.checkout || '10:00'],
              ['駐車場', hotel.parking || '要確認'],
              ['住所', hotel.location],
              ['アクセス', hotel.access || '情報なし'],
            ].map(([l, v]) => (
              <div key={l} style={{ paddingBottom: 10, borderBottom: '1px solid var(--line-soft)' }}>
                <div
                  className="mb-1"
                  style={{
                    fontSize: 10,
                    color: 'var(--text-soft)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {l}
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text)', wordBreak: 'break-word' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related (近くの犬OK宿) */}
      {related.length > 0 && (
        <section
          className="py-8 md:py-10"
          style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <h3
              className="font-bold mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                color: 'var(--text)',
              }}
            >
              近くの犬OK宿
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((h) => (
                <HotelCard key={h.id} hotel={h} layout="vert" />
              ))}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />

      {/* Image modal */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.9)' }}
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-6xl w-full max-h-full overflow-hidden"
            style={{ background: 'var(--surface)', borderRadius: 'var(--r-md)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between p-3 md:p-4"
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <h3 className="text-[14px] md:text-[16px] font-bold line-clamp-1" style={{ color: 'var(--text)' }}>
                {hotel.name} — 写真ギャラリー
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                aria-label="ギャラリーを閉じる"
                className="p-2 transition-colors"
                style={{ borderRadius: 'var(--r-pill)', color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 md:p-4">
              <div className="relative w-full mb-3" style={{ height: 'min(70vh, 500px)' }}>
                <Image
                  src={hotel.images[selectedImageIndex]}
                  alt={`${hotel.name} 写真${selectedImageIndex + 1}`}
                  fill
                  sizes="(max-width: 1280px) 100vw, 1200px"
                  className="object-contain"
                />
                {hotel.images.length > 1 && selectedImageIndex > 0 && (
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                    aria-label="前の写真"
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                {hotel.images.length > 1 && selectedImageIndex < hotel.images.length - 1 && (
                  <button
                    onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                    aria-label="次の写真"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
                    style={{
                      background: 'rgba(0,0,0,0.55)',
                      color: '#fff',
                      borderRadius: 'var(--r-pill)',
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                <div
                  className="absolute bottom-2 right-2 px-2 py-1"
                  style={{
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    borderRadius: 'var(--r-pill)',
                    fontSize: 12,
                  }}
                >
                  {selectedImageIndex + 1} / {hotel.images.length}
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                {hotel.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="relative h-16 cursor-pointer overflow-hidden transition-transform hover:scale-105"
                    style={{
                      borderRadius: 'var(--r-xs)',
                      border: `2px solid ${selectedImageIndex === index ? 'var(--primary)' : 'transparent'}`,
                    }}
                  >
                    <Image
                      src={image}
                      alt={`サムネイル${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 md:p-5 mb-4"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
      }}
    >
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <div style={{ color: 'var(--text-soft)' }}>{label}</div>
      <div style={{ color: 'var(--text)' }}>{value}</div>
    </>
  );
}

function PolicyItem({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="px-3 py-2.5"
      style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }}
    >
      <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-soft)' }}>{label}</div>
      <div className="text-[13px] font-bold" style={{ color: 'var(--text)', wordBreak: 'break-word' }}>{value}</div>
      {sub && (
        <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-soft)' }}>{sub}</div>
      )}
    </div>
  );
}
