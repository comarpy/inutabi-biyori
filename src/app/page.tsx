'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Waves,
  Dog,
  Bone,
  Heart,
  ParkingCircle,
  ShoppingBag,
  Utensils,
  Scissors,
  Home as HomeIcon,
  ChevronDown,
  MapPin,
  PawPrint,
} from 'lucide-react';
import Image from 'next/image';

import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

type DogSize = 'small' | 'medium' | 'large' | 'xl';
type DogCount = '1' | '2' | '3+';
type PriorityKey =
  | 'dogRun'
  | 'hotSpring'
  | 'diningWithDog'
  | 'dogMenu'
  | 'roomDogRun'
  | 'petAmenities'
  | 'parking'
  | 'grooming';

interface PriorityOption {
  key: PriorityKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { key: 'dogRun', label: 'ドッグラン', icon: Bone },
  { key: 'hotSpring', label: '温泉', icon: Waves },
  { key: 'dogMenu', label: '犬用メニュー', icon: Utensils },
  { key: 'roomDogRun', label: '客室ドッグラン', icon: HomeIcon },
  { key: 'petAmenities', label: 'ペット用品貸出', icon: ShoppingBag },
  { key: 'parking', label: '駐車場あり', icon: ParkingCircle },
  { key: 'grooming', label: 'グルーミング', icon: Scissors },
  { key: 'diningWithDog', label: 'ペット同伴食事', icon: Utensils },
];

interface DogSizeOption {
  key: DogSize;
  label: string;
  desc: string;
}

const DOG_SIZE_OPTIONS: DogSizeOption[] = [
  { key: 'small', label: '小型犬', desc: '〜10kg' },
  { key: 'medium', label: '中型犬', desc: '10〜25kg' },
  { key: 'large', label: '大型犬', desc: '25〜40kg' },
  { key: 'xl', label: '超大型犬', desc: '40kg〜' },
];

const DOG_COUNT_OPTIONS: { key: DogCount; label: string }[] = [
  { key: '1', label: '1頭' },
  { key: '2', label: '2頭' },
  { key: '3+', label: '3頭以上' },
];

const AREA_DATA: Record<string, string[]> = {
  北海道: ['北海道'],
  東北: ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  北関東: ['茨城県', '栃木県', '群馬県'],
  首都圏: ['埼玉県', '千葉県', '東京都', '神奈川県'],
  '伊豆・箱根': ['静岡県（伊豆）', '神奈川県（箱根）'],
  甲信越: ['山梨県', '長野県', '新潟県'],
  北陸: ['富山県', '石川県', '福井県'],
  東海: ['岐阜県', '静岡県', '愛知県'],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  中国: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  四国: ['徳島県', '香川県', '愛媛県', '高知県'],
  九州: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  沖縄: ['沖縄県'],
};

// トップページのエリアショートカット（地方区分）
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

function HomeContent() {
  const router = useRouter();

  const [sizes, setSizes] = useState<Set<DogSize>>(new Set());
  const [count, setCount] = useState<DogCount | ''>('');
  const [priorities, setPriorities] = useState<Set<PriorityKey>>(new Set());

  const [showAreaDetail, setShowAreaDetail] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAreaDropdown && !target.closest('.area-dropdown-container')) {
        setShowAreaDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAreaDropdown]);

  const toggleSize = (s: DogSize) => {
    setSizes((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const togglePriority = (k: PriorityKey) => {
    setPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const handleAreaToggle = (area: string) => {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleRegionToggle = (region: string) => {
    const prefectures = AREA_DATA[region];
    if (!prefectures) return;
    const allSelected = prefectures.every((p) => areas.includes(p));
    if (allSelected) {
      setAreas((prev) => prev.filter((a) => !prefectures.includes(a)));
    } else {
      setAreas((prev) => Array.from(new Set([...prev, ...prefectures])));
    }
  };

  const buildSearchUrl = (overrideAreas?: string[]): string => {
    const params = new URLSearchParams();

    if (sizes.has('small')) params.set('smallDog', 'true');
    if (sizes.has('medium')) params.set('mediumDog', 'true');
    if (sizes.has('large')) params.set('largeDog', 'true');
    if (sizes.has('xl')) {
      params.set('xlDog', 'true');
      params.set('largeDog', 'true');
    }

    if (count === '2') {
      params.set('multipleDogs', 'true');
    } else if (count === '3+') {
      params.set('multipleDogs', 'true');
      params.set('minDogs', '3');
    }

    priorities.forEach((k) => {
      if (k === 'diningWithDog') {
        params.set('roomDining', 'true');
      } else {
        params.set(k, 'true');
      }
    });

    const finalAreas = overrideAreas ?? areas;
    if (finalAreas.length > 0) params.set('areas', finalAreas.join(','));
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);

    return `/search?${params.toString()}`;
  };

  const handleSearch = () => {
    router.push(buildSearchUrl());
  };

  const selectedSummary = [
    sizes.size > 0
      ? DOG_SIZE_OPTIONS.filter((o) => sizes.has(o.key)).map((o) => o.label).join('・')
      : null,
    count ? DOG_COUNT_OPTIONS.find((o) => o.key === count)?.label : null,
    priorities.size > 0 ? `${priorities.size}件のこだわり` : null,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader />

      {/* ============== Hero — split layout ============== */}
      <section
        className="px-4 md:px-8 py-8 md:py-16"
        style={{ background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)' }}
      >
        <div className="max-w-7xl mx-auto grid gap-8 md:gap-12 items-center" style={{ gridTemplateColumns: '1fr' }}>
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
            {/* Left — copy + search */}
            <div>
              <div
                className="inline-flex items-center gap-1.5 mb-3 md:mb-4 px-3 py-1.5"
                style={{
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--r-pill)',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <PawPrint className="w-3 h-3" />
                INUTABI · BIYORI
              </div>

              <h1
                className="font-bold mb-3 md:mb-4"
                style={{
                  fontSize: 'clamp(28px, 5vw, 46px)',
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  color: 'var(--text)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                }}
              >
                犬連れで泊まる、
                <br />
                <span style={{ color: 'var(--primary)' }}>ぴったりの宿</span>を。
              </h1>
              <p
                className="text-sm md:text-base mb-5 md:mb-6"
                style={{ color: 'var(--text-muted)', maxWidth: 540 }}
              >
                犬種・頭数・設備で正確に絞り込み。<br className="md:hidden" />
                サイズ・こだわりから、愛犬に合う宿が見つかります。
              </p>

              {/* Quick search summary card */}
              <div
                className="p-4 md:p-5"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--sh-md)',
                }}
              >
                <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--primary)' }}>
                  <Dog className="w-4 h-4" />
                  <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                    愛犬のプロフィールから探す
                  </span>
                </div>

                {/* STEP 1: 犬のサイズ */}
                <div className="mb-3">
                  <div className="text-[11px] mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    1. 犬のサイズ <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(複数OK)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DOG_SIZE_OPTIONS.map((opt) => {
                      const active = sizes.has(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => toggleSize(opt.key)}
                          aria-pressed={active}
                          className="text-center transition-all active:scale-[0.98]"
                          style={{
                            padding: '8px 4px',
                            borderRadius: 'var(--r-sm)',
                            background: active ? 'var(--primary-soft)' : 'var(--surface)',
                            color: active ? 'var(--primary)' : 'var(--text)',
                            border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                          <div style={{ fontSize: 9, color: active ? 'var(--primary)' : 'var(--text-soft)', fontWeight: 400 }}>
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 2: 頭数 */}
                <div className="mb-3">
                  <div className="text-[11px] mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    2. 頭数
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DOG_COUNT_OPTIONS.map((opt) => {
                      const active = count === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setCount(active ? '' : opt.key)}
                          aria-pressed={active}
                          className="transition-all active:scale-[0.98]"
                          style={{
                            padding: '9px 0',
                            borderRadius: 'var(--r-sm)',
                            background: active ? 'var(--primary-soft)' : 'var(--surface)',
                            color: active ? 'var(--primary)' : 'var(--text)',
                            border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 3: こだわり */}
                <div className="mb-3">
                  <div className="text-[11px] mb-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
                    3. こだわり <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(任意)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIORITY_OPTIONS.map((opt) => {
                      const active = priorities.has(opt.key);
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => togglePriority(opt.key)}
                          aria-pressed={active}
                          className="inline-flex items-center gap-1 transition-all active:scale-[0.98]"
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--r-pill)',
                            background: active ? 'var(--primary)' : 'var(--surface)',
                            color: active ? 'var(--on-primary)' : 'var(--text-muted)',
                            border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Icon className="w-3 h-3" />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* STEP 4: 行き先・日程 (折りたたみ) */}
                <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAreaDetail((v) => !v)}
                    aria-expanded={showAreaDetail}
                    className="w-full flex items-center justify-between"
                    style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 }}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      行き先・日程
                      <span style={{ color: 'var(--text-soft)', fontWeight: 400, fontSize: 11 }}>(任意)</span>
                      {(areas.length > 0 || checkIn || checkOut) && (
                        <span
                          className="ml-1 px-1.5 py-0.5"
                          style={{
                            background: 'var(--primary-soft)',
                            color: 'var(--primary)',
                            borderRadius: 'var(--r-pill)',
                            fontSize: 10,
                          }}
                        >
                          設定済み
                        </span>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showAreaDetail ? 'rotate-180' : ''}`}
                      style={{ color: 'var(--text-soft)' }}
                    />
                  </button>

                  {showAreaDetail && (
                    <div className="mt-3 space-y-2">
                      <div className="relative area-dropdown-container">
                        <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>エリア</label>
                        <button
                          type="button"
                          onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                          className="w-full flex items-center justify-between"
                          style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--r-sm)',
                            padding: '9px 12px',
                            fontSize: 13,
                            color: 'var(--text)',
                          }}
                        >
                          <span className="flex-1 min-w-0 truncate text-left">
                            {areas.length > 0 ? areas.join(', ') : '全国で探す'}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`}
                            style={{ color: 'var(--text-soft)' }}
                          />
                        </button>
                        {showAreaDropdown && (
                          <div
                            className="absolute top-full left-0 mt-2 w-[min(90vw,42rem)] max-w-[calc(100vw-2rem)] z-50 max-h-[60vh] flex flex-col"
                            style={{
                              background: 'var(--surface)',
                              border: '1px solid var(--line)',
                              borderRadius: 'var(--r-md)',
                              boxShadow: 'var(--sh-lg)',
                            }}
                          >
                            <div className="flex-1 overflow-y-auto p-3">
                              <div className="space-y-2">
                                {Object.entries(AREA_DATA).map(([region, prefectures]) => {
                                  const allSelected = prefectures.every((p) => areas.includes(p));
                                  const someSelected = prefectures.some((p) => areas.includes(p));
                                  return (
                                    <div
                                      key={region}
                                      className="p-2"
                                      style={{ border: '1px solid var(--line-soft)', borderRadius: 'var(--r-sm)' }}
                                    >
                                      <label className="inline-flex items-center cursor-pointer p-1">
                                        <input
                                          type="checkbox"
                                          checked={allSelected}
                                          ref={(el) => {
                                            if (el) el.indeterminate = someSelected && !allSelected;
                                          }}
                                          onChange={() => handleRegionToggle(region)}
                                          className="form-checkbox h-4 w-4"
                                        />
                                        <span className="ml-2 text-sm font-bold" style={{ color: 'var(--primary)' }}>
                                          {region}
                                        </span>
                                      </label>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 pl-4 mt-1">
                                        {prefectures.map((pref) => (
                                          <label
                                            key={pref}
                                            className="inline-flex items-center cursor-pointer p-1"
                                          >
                                            <input
                                              type="checkbox"
                                              checked={areas.includes(pref)}
                                              onChange={() => handleAreaToggle(pref)}
                                              className="form-checkbox h-3 w-3"
                                            />
                                            <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                              {pref}
                                            </span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <div
                              className="flex-shrink-0 px-3 py-2"
                              style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }}
                            >
                              <button
                                onClick={() => setShowAreaDropdown(false)}
                                className="kt-btn kt-btn--primary w-full"
                                style={{ padding: '9px 0', fontSize: 13 }}
                              >
                                決定
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>
                            チェックイン
                          </label>
                          <input
                            type="date"
                            className="w-full"
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--line)',
                              borderRadius: 'var(--r-sm)',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: 'var(--text)',
                            }}
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>
                            チェックアウト
                          </label>
                          <input
                            type="date"
                            className="w-full"
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--line)',
                              borderRadius: 'var(--r-sm)',
                              padding: '9px 10px',
                              fontSize: 13,
                              color: 'var(--text)',
                            }}
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected summary */}
                {selectedSummary && (
                  <div
                    className="mt-3 px-3 py-2 flex items-start gap-2"
                    style={{
                      background: 'var(--primary-soft)',
                      borderRadius: 'var(--r-sm)',
                      fontSize: 12,
                    }}
                  >
                    <Heart className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--primary)' }}>選択中:</span>{' '}
                      <span style={{ color: 'var(--text)' }}>{selectedSummary}</span>
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={handleSearch}
                  className="kt-btn kt-btn--primary w-full mt-3"
                  style={{ padding: '14px 18px', fontSize: 15 }}
                >
                  <Search className="w-4 h-4" />
                  愛犬に合う宿を探す
                </button>
                <p className="text-center mt-2" style={{ fontSize: 11, color: 'var(--text-soft)' }}>
                  条件未選択でも全国の宿を一覧できます
                </p>
              </div>

              {/* Stats */}
              <div className="hidden md:flex gap-6 mt-6" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                <div>
                  <b style={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>500+</b>
                  <br />掲載宿
                </div>
                <div>
                  <b style={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>47</b>
                  <br />都道府県
                </div>
                <div>
                  <b style={{ color: 'var(--text)', fontSize: 22, fontWeight: 800 }}>毎週</b>
                  <br />情報更新
                </div>
              </div>
            </div>

            {/* Right — hero image */}
            <div
              className="relative hidden md:block"
              style={{
                height: 420,
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--sh-lg)',
              }}
            >
              <Image
                src="/images/画像2.jpeg"
                alt="愛犬と泊まる宿のイメージ"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============== Why セクション ============== */}
      <section className="px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-10">
            <p
              className="inline-block mb-2"
              style={{
                fontSize: 11,
                letterSpacing: '0.18em',
                color: 'var(--primary)',
                fontWeight: 700,
              }}
            >
              WHY 犬旅びより
            </p>
            <h2
              className="font-bold"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(20px, 3.5vw, 28px)',
                color: 'var(--text)',
                lineHeight: 1.4,
              }}
            >
              普通の旅行サイトでは探しにくい条件で、
              <br className="md:hidden" />
              愛犬にぴったりの宿を
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            {[
              {
                icon: Dog,
                title: '犬のサイズで正確に絞れる',
                desc: '小型・中型・大型・超大型まで、愛犬のサイズに対応した宿だけを絞り込み。',
              },
              {
                icon: Heart,
                title: '多頭飼いにもやさしい',
                desc: '2頭・3頭以上も宿泊可能な宿を頭数で絞れる。多頭飼い家庭でも安心。',
              },
              {
                icon: Bone,
                title: 'こだわり条件で過ごし方を決める',
                desc: 'ドッグラン・温泉・客室ドッグラン・犬用メニューなど、過ごし方から選べる。',
              },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="p-5 md:p-6 transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--sh-sm)',
                  }}
                >
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 mb-3"
                    style={{
                      background: 'var(--primary-soft)',
                      borderRadius: 'var(--r-sm)',
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 className="font-bold mb-1.5" style={{ color: 'var(--text)' }}>
                    {card.title}
                  </h3>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============== エリアから探す ============== */}
      <section
        className="px-4 md:px-8 py-12 md:py-16"
        style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)' }}
      >
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(20px, 3.5vw, 26px)',
              color: 'var(--text)',
            }}
          >
            エリアから探す
          </h2>
          <p className="text-sm mb-5 md:mb-6" style={{ color: 'var(--text-soft)' }}>
            行きたい地方から愛犬と泊まれる宿を探せます
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
            {REGION_SHORTCUTS.map((r) => (
              <button
                key={r.name}
                onClick={() => router.push(buildSearchUrl(r.areas))}
                className="text-left transition-all hover:-translate-y-0.5"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--sh-sm)',
                }}
              >
                <div>
                  <div
                    className="font-bold"
                    style={{
                      fontSize: 15,
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text)',
                    }}
                  >
                    {r.name}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-soft)' }}>
                    {r.areas.length}都道府県
                  </div>
                </div>
                <ChevronDown
                  className="w-4 h-4 -rotate-90"
                  style={{ color: 'var(--text-soft)' }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
              style={{
                borderBottom: '2px solid var(--primary)',
                borderLeft: '2px solid transparent',
                borderRight: '2px solid transparent',
                borderTop: '2px solid transparent',
              }}
            />
            <p style={{ color: 'var(--text-muted)' }}>ページを読み込み中...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
