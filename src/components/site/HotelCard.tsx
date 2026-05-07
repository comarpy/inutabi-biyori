import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import type { Hotel } from '@/lib/hotelService';

type Layout = 'row' | 'vert';

export default function HotelCard({
  hotel,
  layout = 'vert',
  priority = false,
}: {
  hotel: Hotel;
  layout?: Layout;
  priority?: boolean;
}) {
  // 受入可能サイズを1ピルに集約（"全サイズOK" / "小型・中型OK" 等）
  const sizes = [
    hotel.smallDog && '小型',
    hotel.mediumDog && '中型',
    hotel.largeDog && '大型',
  ].filter(Boolean) as string[];
  const sizeLabel =
    sizes.length === 0
      ? null
      : sizes.length === 3
        ? '全サイズOK'
        : `${sizes.join('・')}OK`;

  if (layout === 'row') {
    return (
      <Link
        href={`/hotel/${hotel.id}`}
        prefetch
        className="group block transition-all hover:-translate-y-0.5"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          boxShadow: 'var(--sh-sm)',
        }}
      >
        <div className="grid" style={{ gridTemplateColumns: '120px 1fr' }}>
          <div className="relative" style={{ minHeight: 120, background: 'var(--surface-2)' }}>
            <Image
              src={hotel.image}
              alt={hotel.name}
              fill
              sizes="120px"
              priority={priority}
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <div
              className="text-[11px] flex items-center gap-1"
              style={{ color: 'var(--text-soft)' }}
            >
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{hotel.location}</span>
            </div>
            <div
              className="text-[13px] font-bold mt-1 line-clamp-2"
              style={{ color: 'var(--text)', lineHeight: 1.4 }}
            >
              {hotel.name}
            </div>
            {sizeLabel && (
              <div className="mt-1.5">
                <span className="kt-pill kt-pill--ok" style={{ fontSize: 9, padding: '2px 8px' }}>
                  {sizeLabel}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              {hotel.reviewAverage ? (
                <span
                  className="text-[10px] flex items-center gap-1"
                  style={{ color: 'var(--text-soft)' }}
                >
                  <Star className="w-3 h-3" style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                    {hotel.reviewAverage.toFixed(1)}
                  </span>
                  {hotel.reviewCount ? <span>({hotel.reviewCount})</span> : null}
                </span>
              ) : <span />}
              <span
                className="text-[13px] font-bold"
                style={{ color: 'var(--primary)' }}
              >
                ¥{hotel.price.toLocaleString()}〜
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // vert (default)
  return (
    <Link
      href={`/hotel/${hotel.id}`}
      prefetch
      className="group block transition-all hover:-translate-y-0.5"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        boxShadow: 'var(--sh-sm)',
      }}
    >
      <div className="relative" style={{ height: 170, background: 'var(--surface-2)' }}>
        <Image
          src={hotel.image}
          alt={hotel.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div
              className="text-[11px] flex items-center gap-1"
              style={{ color: 'var(--text-soft)' }}
            >
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{hotel.location}</span>
            </div>
            <div
              className="text-[14px] font-bold mt-1 line-clamp-2"
              style={{ color: 'var(--text)', lineHeight: 1.4 }}
            >
              {hotel.name}
            </div>
          </div>
          {hotel.reviewAverage ? (
            <div
              className="flex items-center gap-1 flex-shrink-0"
              style={{ color: 'var(--gold)', fontSize: 11, fontWeight: 700 }}
            >
              <Star className="w-3 h-3" style={{ fill: 'var(--gold)' }} />
              {hotel.reviewAverage.toFixed(1)}
            </div>
          ) : null}
        </div>

        {sizeLabel && (
          <div className="mt-2">
            <span className="kt-pill kt-pill--ok" style={{ fontSize: 10, padding: '3px 10px' }}>
              {sizeLabel}
            </span>
          </div>
        )}

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {hotel.amenities.slice(0, 3).map((a) => (
              <span key={a} className="kt-pill" style={{ fontSize: 10, padding: '2px 8px' }}>
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-baseline mt-3">
          <span className="text-[11px]" style={{ color: 'var(--text-soft)' }}>
            {hotel.reviewCount ? `${hotel.reviewCount}件のレビュー` : '1泊2食'}
          </span>
          <span className="text-[16px] font-bold" style={{ color: 'var(--primary)' }}>
            ¥{hotel.price.toLocaleString()}〜
          </span>
        </div>
      </div>
    </Link>
  );
}
