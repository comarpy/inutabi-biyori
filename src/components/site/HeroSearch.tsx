'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Waves,
  Bone,
  ParkingCircle,
  Home as HomeIcon,
  ChevronDown,
  Heart,
  Bath,
  Utensils,
  ShoppingBag,
  Scissors,
  Sparkles,
} from 'lucide-react';

type DogSize = 'small' | 'medium' | 'large' | 'xl';
type DogCount = '1' | '2' | '3+';
type PriorityKey =
  | 'parking'
  | 'hotSpring'
  | 'privateBath'
  | 'dogRun'
  | 'roomDogRun'
  | 'petAmenities'
  | 'roomDining'
  | 'dogMenu'
  | 'grooming'
  | 'leashFree';

interface PriorityOption {
  key: PriorityKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { key: 'parking', label: '駐車場', icon: ParkingCircle },
  { key: 'hotSpring', label: '温泉', icon: Waves },
  { key: 'privateBath', label: '露天風呂付き客室', icon: Bath },
  { key: 'dogRun', label: '敷地内ドッグラン', icon: Bone },
  { key: 'roomDogRun', label: '客室ドッグラン', icon: HomeIcon },
  { key: 'petAmenities', label: 'ペットアメニティ', icon: ShoppingBag },
  { key: 'roomDining', label: '一緒にごはん', icon: Utensils },
  { key: 'dogMenu', label: '犬メニュー', icon: Bone },
  { key: 'grooming', label: 'グルーミングルーム', icon: Scissors },
  { key: 'leashFree', label: '施設内リードでOK', icon: Sparkles },
];

const DOG_SIZE_OPTIONS: { key: DogSize; label: string; desc: string }[] = [
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
  '伊豆・箱根': ['静岡県(伊豆)', '神奈川県(箱根)'],
  甲信越: ['山梨県', '長野県', '新潟県'],
  北陸: ['富山県', '石川県', '福井県'],
  東海: ['岐阜県', '静岡県', '愛知県'],
  近畿: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  中国: ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
  四国: ['徳島県', '香川県', '愛媛県', '高知県'],
  九州: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
  沖縄: ['沖縄県'],
};

export default function HeroSearch() {
  const router = useRouter();

  const [showDetails, setShowDetails] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const [sizes, setSizes] = useState<Set<DogSize>>(new Set());
  const [count, setCount] = useState<DogCount | ''>('');
  const [priorities, setPriorities] = useState<Set<PriorityKey>>(new Set());
  const [areas, setAreas] = useState<string[]>([]);

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
    setAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]));
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (sizes.has('small')) params.set('smallDog', 'true');
    if (sizes.has('medium')) params.set('mediumDog', 'true');
    if (sizes.has('large')) params.set('largeDog', 'true');
    if (sizes.has('xl')) {
      params.set('xlDog', 'true');
      params.set('largeDog', 'true');
    }
    if (count === '2') params.set('multipleDogs', 'true');
    else if (count === '3+') {
      params.set('multipleDogs', 'true');
      params.set('minDogs', '3');
    }
    priorities.forEach((k) => params.set(k, 'true'));
    if (areas.length > 0) params.set('areas', areas.join(','));
    router.push(`/search?${params.toString()}`);
  };

  const detailCount = sizes.size + (count ? 1 : 0) + priorities.size;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--sh-lg)',
        border: '1px solid var(--line)',
      }}
      className="p-3 md:p-4"
    >
      {/* Quick search row */}
      <div
        className="flex gap-3 items-center area-dropdown-container relative"
        style={{ padding: '4px 4px 4px 12px' }}
      >
        <Search className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
        <button
          type="button"
          onClick={() => setShowAreaDropdown(!showAreaDropdown)}
          className="flex-1 text-left text-[15px] md:text-[16px] truncate"
          style={{ color: areas.length > 0 ? 'var(--text)' : 'var(--text-soft)', padding: '8px 0' }}
        >
          {areas.length > 0 ? areas.join(', ') : 'エリアで検索 (例: 軽井沢、箱根)'}
        </button>
        <button
          type="button"
          onClick={handleSearch}
          className="kt-btn kt-btn--primary flex-shrink-0"
          style={{ padding: '14px 28px', fontSize: 15 }}
        >
          <Search className="w-5 h-5" />
          検索
        </button>

        {showAreaDropdown && (
          <div
            className="absolute left-0 right-0 z-50 max-h-[60vh] flex flex-col"
            style={{
              top: '100%',
              marginTop: 8,
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
                          <label key={pref} className="inline-flex items-center cursor-pointer p-1">
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

      {/* Detail conditions toggle */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: '1px solid var(--line-soft)' }}
      >
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
          className="flex items-center gap-1.5 text-[12px] font-semibold"
          style={{ color: 'var(--text-muted)' }}
        >
          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
          条件から絞り込み
          {detailCount > 0 && (
            <span
              className="ml-1 px-1.5 py-0.5"
              style={{
                background: 'var(--primary-soft)',
                color: 'var(--primary)',
                borderRadius: 'var(--r-pill)',
                fontSize: 10,
              }}
            >
              {detailCount}件
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          />
        </button>
        <span className="text-[11px]" style={{ color: 'var(--text-soft)' }}>
          サイズ・頭数・設備
        </span>
      </div>

      {showDetails && (
        <div className="mt-3 space-y-3">
          {/* Sizes */}
          <div>
            <div
              className="text-[11px] mb-1.5 font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              犬のサイズ <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(複数OK)</span>
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
                    style={{
                      padding: '8px 4px',
                      borderRadius: 'var(--r-sm)',
                      background: active ? 'var(--primary-soft)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text)',
                      border: `1.5px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 400,
                        color: active ? 'var(--primary)' : 'var(--text-soft)',
                      }}
                    >
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Count */}
          <div>
            <div
              className="text-[11px] mb-1.5 font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              頭数
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

          {/* Priorities */}
          <div>
            <div
              className="text-[11px] mb-1.5 font-semibold"
              style={{ color: 'var(--text-muted)' }}
            >
              こだわり <span style={{ color: 'var(--text-soft)', fontWeight: 400 }}>(任意)</span>
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
                    className="inline-flex items-center gap-1"
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

          {/* Apply */}
          <button
            type="button"
            onClick={handleSearch}
            className="kt-btn kt-btn--primary w-full"
            style={{ padding: '11px 0', fontSize: 14 }}
          >
            <Search className="w-4 h-4" />
            この条件で宿を探す
          </button>
        </div>
      )}

    </div>
  );
}
