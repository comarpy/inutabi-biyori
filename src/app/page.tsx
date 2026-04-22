'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Hotel,
  Waves,
  Dog,
  Bone,
  Heart,
  ParkingCircle,
  Instagram,
  Facebook,
  ShoppingBag,
  Utensils,
  Scissors,
  Home as HomeIcon,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { XIcon } from '../components/XIcon';

import Link from 'next/link';

// 犬のサイズ
type DogSize = 'small' | 'medium' | 'large' | 'xl';

// 頭数（UI の select 値）
type DogCount = '1' | '2' | '3+';

// こだわり条件の key（既存の DetailFilters キーと揃えている）
type PriorityKey =
  | 'dogRun'
  | 'hotSpring'
  | 'diningWithDog' // 送信時に roomDining にマップ
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
  iconSize: number;
}

const DOG_SIZE_OPTIONS: DogSizeOption[] = [
  { key: 'small', label: '小型犬', desc: '〜10kg', iconSize: 20 },
  { key: 'medium', label: '中型犬', desc: '10〜25kg', iconSize: 26 },
  { key: 'large', label: '大型犬', desc: '25〜40kg', iconSize: 34 },
  { key: 'xl', label: '超大型犬', desc: '40kg〜', iconSize: 42 },
];

const DOG_COUNT_OPTIONS: { key: DogCount; label: string }[] = [
  { key: '1', label: '1頭' },
  { key: '2', label: '2頭' },
  { key: '3+', label: '3頭以上' },
];

// エリア階層データ構造
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

function HomeContent() {
  const router = useRouter();

  // === 愛犬プロフィール ===
  // サイズ（複数選択可: 多頭飼いでサイズが違う場合に対応）
  const [sizes, setSizes] = useState<Set<DogSize>>(new Set());
  // 頭数（単一選択）
  const [count, setCount] = useState<DogCount | ''>('');
  // こだわり条件（複数選択）
  const [priorities, setPriorities] = useState<Set<PriorityKey>>(new Set());

  // === オプション: 行き先・日程 ===
  const [showAreaDetail, setShowAreaDetail] = useState(false);
  const [areas, setAreas] = useState<string[]>([]);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  // 外側クリックでドロップダウンを閉じる
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

  const handleSearch = () => {
    // クエリ組み立て（既存 /search の仕様に合わせる）
    const params = new URLSearchParams();

    // サイズ → 既存フィルタにマップ
    if (sizes.has('small')) params.set('smallDog', 'true');
    if (sizes.has('medium')) params.set('mediumDog', 'true');
    if (sizes.has('large')) params.set('largeDog', 'true');
    // 超大型犬はバックエンドに未対応。将来のために query は残す。
    // UX上は largeDog と同じ扱い（現データでのベストマッチ）。
    if (sizes.has('xl')) {
      params.set('xlDog', 'true');
      params.set('largeDog', 'true');
    }

    // 頭数
    if (count === '2') {
      params.set('multipleDogs', 'true');
    } else if (count === '3+') {
      params.set('multipleDogs', 'true');
      // 3頭以上はバックエンド未対応。将来のために query は残す。
      params.set('minDogs', '3');
    }

    // こだわり条件
    priorities.forEach((k) => {
      if (k === 'diningWithDog') {
        // DetailFilters では roomDining だが、microCMS 側は diningWithDog で判定済み。
        // UI上の意図を /search 側に伝えるため便宜的に roomDining をセット。
        params.set('roomDining', 'true');
      } else {
        params.set(k, 'true');
      }
    });

    // エリア・日程（任意）
    if (areas.length > 0) params.set('areas', areas.join(','));
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);

    router.push(`/search?${params.toString()}`);
  };

  const selectedSummary = [
    sizes.size > 0
      ? DOG_SIZE_OPTIONS.filter((o) => sizes.has(o.key))
          .map((o) => o.label)
          .join('・')
      : null,
    count ? DOG_COUNT_OPTIONS.find((o) => o.key === count)?.label : null,
    priorities.size > 0 ? `${priorities.size}件のこだわり` : null,
  ]
    .filter(Boolean)
    .join(' / ');

  const canSearch = sizes.size > 0 || count !== '' || priorities.size > 0 || areas.length > 0;

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* パターン背景 */}
      <div className="fixed inset-0 opacity-15 pointer-events-none z-0">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 15px 8px at 25px 25px, #E8D5B7 40%, transparent 40%),
              radial-gradient(ellipse 15px 8px at 75px 25px, #E8D5B7 40%, transparent 40%),
              radial-gradient(circle 4px at 15px 25px, #E8D5B7 100%, transparent 100%),
              radial-gradient(circle 4px at 35px 25px, #E8D5B7 100%, transparent 100%),
              radial-gradient(circle 4px at 65px 25px, #E8D5B7 100%, transparent 100%),
              radial-gradient(circle 4px at 85px 25px, #E8D5B7 100%, transparent 100%)
            `,
            backgroundSize: '100px 50px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <header className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white px-3 py-2.5 md:py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center min-w-0">
              <Dog className="w-6 h-6 mr-2 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-base md:text-lg">犬旅びより</span>
                <span className="text-[10px] md:text-xs opacity-90 truncate hidden sm:inline">
                  - 愛犬に合う宿が見つかる、旅の検索サイト
                </span>
              </div>
            </div>
            <nav className="flex items-center space-x-3 md:space-x-4 flex-shrink-0">
              <Link href="/contact" className="text-xs md:text-sm hover:text-gray-200 cursor-pointer">
                お問い合わせ
              </Link>
              <Link
                href="/business-contact"
                className="text-xs md:text-sm hover:text-gray-200 cursor-pointer flex items-center"
              >
                <Dog className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">宿を掲載する</span>
                <span className="sm:hidden">掲載</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* ヒーローエリア */}
        <section
          className="relative min-h-[680px] md:min-h-[780px] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center py-14 md:py-20 px-4"
          style={{
            backgroundImage: "url('/images/画像2.jpeg')",
            backgroundPosition: 'center 30%',
          }}
        >
          {/* オーバーレイ: 下に行くほど暗くする（可読性向上） */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/55" />
          {/* 暖色の微かな照り */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#3D2E1E]/10 via-transparent to-[#FF5A5F]/5" />

          {/* キャッチコピー */}
          <div className="relative z-10 text-center mb-8 md:mb-10 max-w-3xl px-2">
            {/* リード */}
            <div className="inline-flex items-center gap-1.5 text-[11px] md:text-xs text-white/90 tracking-widest uppercase mb-3 md:mb-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF8A8F]" />
              Inutabi-biyori
            </div>

            <h1 className="text-[34px] leading-[1.15] md:text-[56px] md:leading-[1.1] font-bold text-white mb-4 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              愛犬に合う宿を、<br className="md:hidden" />
              <span className="text-[#FFD9B0]">失敗せずに</span>選ぶ。
            </h1>
            <p className="text-[15px] md:text-lg text-white/95 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
              サイズ・頭数・過ごし方から、<br className="md:hidden" />
              あなたの愛犬で本当に泊まれる宿が見つかります。
            </p>
          </div>

          {/* 検索カード */}
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] overflow-visible ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white px-5 py-3 rounded-t-3xl">
              <h2 className="text-sm md:text-base font-bold flex items-center justify-center tracking-wide">
                <Dog className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                愛犬のプロフィールから探す
              </h2>
            </div>

            <div className="p-5 md:p-7 space-y-6">
              {/* STEP 1: 犬のサイズ */}
              <div>
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white text-[11px] font-bold mr-2.5 shadow-sm">
                    1
                  </span>
                  <label className="text-sm md:text-[15px] font-semibold text-gray-900">
                    犬のサイズ
                    <span className="ml-2 text-[11px] font-normal text-gray-500">
                      複数選択OK
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {DOG_SIZE_OPTIONS.map((opt) => {
                    const active = sizes.has(opt.key);
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleSize(opt.key)}
                        aria-pressed={active}
                        className={`group relative rounded-2xl border-2 px-3 py-4 min-h-[96px] transition-all duration-200 flex flex-col items-center justify-center text-center active:scale-[0.98] ${
                          active
                            ? 'border-[#FF5A5F] bg-gradient-to-b from-[#FFF5F5] to-[#FFEDED] shadow-[0_4px_12px_-4px_rgba(255,90,95,0.3)]'
                            : 'border-[#E8D5B7]/60 bg-white hover:border-[#FF5A5F]/50 hover:bg-[#FFFAF5]'
                        }`}
                      >
                        {active && (
                          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF5A5F] text-white text-[10px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                        <Dog
                          className={`transition-colors ${
                            active ? 'text-[#FF5A5F]' : 'text-[#8B7355] group-hover:text-[#FF5A5F]/80'
                          }`}
                          style={{ width: opt.iconSize, height: opt.iconSize }}
                        />
                        <span
                          className={`text-sm font-bold mt-1.5 ${
                            active ? 'text-[#FF5A5F]' : 'text-gray-800'
                          }`}
                        >
                          {opt.label}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: 頭数 */}
              <div>
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white text-[11px] font-bold mr-2.5 shadow-sm">
                    2
                  </span>
                  <label className="text-sm md:text-[15px] font-semibold text-gray-900">頭数</label>
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {DOG_COUNT_OPTIONS.map((opt) => {
                    const active = count === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCount(active ? '' : opt.key)}
                        aria-pressed={active}
                        className={`rounded-2xl border-2 py-3.5 md:py-4 font-semibold transition-all duration-200 active:scale-[0.98] ${
                          active
                            ? 'border-[#FF5A5F] bg-gradient-to-b from-[#FFF5F5] to-[#FFEDED] text-[#FF5A5F] shadow-[0_4px_12px_-4px_rgba(255,90,95,0.3)]'
                            : 'border-[#E8D5B7]/60 bg-white text-gray-800 hover:border-[#FF5A5F]/50 hover:bg-[#FFFAF5]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: こだわり条件 */}
              <div>
                <div className="flex items-center mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white text-[11px] font-bold mr-2.5 shadow-sm">
                    3
                  </span>
                  <label className="text-sm md:text-[15px] font-semibold text-gray-900">
                    こだわり条件
                    <span className="ml-2 text-[11px] font-normal text-gray-500">任意</span>
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((opt) => {
                    const active = priorities.has(opt.key);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => togglePriority(opt.key)}
                        aria-pressed={active}
                        className={`rounded-full border px-3.5 py-2 text-[13px] md:text-sm font-medium transition-all duration-200 flex items-center active:scale-[0.98] ${
                          active
                            ? 'border-[#FF5A5F] bg-[#FF5A5F] text-white shadow-[0_4px_10px_-3px_rgba(255,90,95,0.45)]'
                            : 'border-[#E8D5B7]/60 bg-white text-gray-700 hover:border-[#FF5A5F]/50 hover:bg-[#FFF7F7] hover:text-[#FF5A5F]'
                        }`}
                      >
                        <Icon className="w-4 h-4 mr-1.5" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 4: 行き先・日程 (任意・折りたたみ) */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAreaDetail((v) => !v)}
                  aria-expanded={showAreaDetail}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="flex items-center text-sm md:text-base font-semibold text-gray-800">
                    <MapPin className="w-4 h-4 mr-1.5 text-[#FF5A5F]" />
                    行き先・日程
                    <span className="ml-2 text-xs font-normal text-gray-500">(任意)</span>
                    {(areas.length > 0 || checkIn || checkOut) && (
                      <span className="ml-2 text-xs bg-[#FFF0F0] text-[#FF5A5F] px-2 py-0.5 rounded-full border border-[#FFE4E4]">
                        設定済み
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      showAreaDetail ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showAreaDetail && (
                  <div className="mt-3 space-y-3">
                    {/* エリア */}
                    <div className="relative area-dropdown-container">
                      <label className="block text-xs text-gray-600 mb-1">エリア</label>
                      <button
                        type="button"
                        onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                        className="w-full h-12 px-3 text-sm rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#FF5A5F] transition-all text-left flex items-center justify-between"
                      >
                        <span className="flex-1 min-w-0 truncate text-gray-700">
                          {areas.length > 0 ? areas.join(', ') : '全国で探す'}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 transition-transform ${
                            showAreaDropdown ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {showAreaDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-[min(90vw,42rem)] max-w-[calc(100vw-2rem)] bg-white border-2 border-gray-300 rounded-xl shadow-2xl z-50 max-h-[60vh] flex flex-col">
                          <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                              {Object.entries(AREA_DATA).map(([region, prefectures]) => {
                                const allSelected = prefectures.every((p) => areas.includes(p));
                                const someSelected = prefectures.some((p) => areas.includes(p));
                                return (
                                  <div
                                    key={region}
                                    className="border border-gray-100 rounded-lg p-3"
                                  >
                                    <label className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => {
                                          if (el) el.indeterminate = someSelected && !allSelected;
                                        }}
                                        onChange={() => handleRegionToggle(region)}
                                        className="form-checkbox h-4 w-4 text-[#FF5A5F] rounded focus:ring-[#FF5A5F] border-2 border-gray-300"
                                      />
                                      <span className="ml-2 text-sm font-bold text-[#FF5A5F]">
                                        {region}
                                      </span>
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 pl-4 mt-1">
                                      {prefectures.map((pref) => (
                                        <label
                                          key={pref}
                                          className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={areas.includes(pref)}
                                            onChange={() => handleAreaToggle(pref)}
                                            className="form-checkbox h-3 w-3 text-[#FF5A5F] rounded border-2 border-gray-300"
                                          />
                                          <span className="ml-2 text-xs text-gray-700">{pref}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex-shrink-0 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-xl">
                            <button
                              onClick={() => setShowAreaDropdown(false)}
                              className="w-full px-4 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#FF385C] transition-colors text-sm font-medium"
                            >
                              決定
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 日付 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">チェックイン</label>
                        <input
                          type="date"
                          className="w-full h-12 px-3 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">チェックアウト</label>
                        <input
                          type="date"
                          className="w-full h-12 px-3 text-sm rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={checkIn || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 選択中サマリー */}
              {selectedSummary && (
                <div className="text-xs md:text-[13px] bg-gradient-to-r from-[#FFF5F0] to-[#FFFAF5] rounded-xl px-3.5 py-2.5 border border-[#E8D5B7]/50 flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 mt-0.5 text-[#FF5A5F] flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">選択中:</span>{' '}
                    <span className="text-gray-700">{selectedSummary}</span>
                  </div>
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleSearch}
                className="w-full h-14 md:h-16 text-[15px] md:text-base rounded-2xl bg-gradient-to-r from-[#FF5A5F] via-[#FF4D5A] to-[#FF385C] text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_12px_28px_-8px_rgba(255,90,95,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(255,90,95,0.4)] ring-1 ring-white/20"
              >
                <Search className="w-5 h-5" />
                <span>愛犬に合う宿を探す</span>
              </button>

              <p className="text-center text-[11px] md:text-xs text-gray-500">
                条件未選択でも「全国の犬と泊まれる宿」を一覧できます
              </p>
            </div>
          </div>
        </section>

        {/* 価値説明セクション */}
        <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8 md:mb-10">
            <p className="inline-block text-[11px] md:text-xs tracking-widest text-[#FF5A5F] font-semibold uppercase mb-2">
              Why 犬旅びより
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              普通の旅行サイトでは探しにくい条件で、<br className="md:hidden" />
              愛犬にぴったりの宿を
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            <div className="group bg-white border border-[#E8D5B7]/40 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFF0F0] to-[#FFE4E4] mb-3 group-hover:scale-110 transition-transform">
                <Dog className="w-5 h-5 text-[#FF5A5F]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">犬のサイズで正確に絞れる</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                小型・中型・大型・超大型まで、愛犬のサイズに対応した宿だけを絞り込み。
              </p>
            </div>
            <div className="group bg-white border border-[#E8D5B7]/40 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5F0E8] to-[#E8D5B7]/40 mb-3 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-[#B8860B]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">多頭飼いにもやさしい</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                2頭・3頭以上も宿泊可能な宿を頭数で絞れる。多頭飼い家庭でも安心。
              </p>
            </div>
            <div className="group bg-white border border-[#E8D5B7]/40 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#EFF4EC] to-[#DCE6D5] mb-3 group-hover:scale-110 transition-transform">
                <Bone className="w-5 h-5 text-[#5F7A4E]" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">こだわり条件で過ごし方を決める</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                ドッグラン・温泉・客室ドッグラン・犬用メニューなど、過ごし方から選べる。
              </p>
            </div>
          </div>
        </section>

        {/* フッター */}
        <footer className="bg-[#3A3A3A] text-white mt-16 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <Hotel className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  宿泊施設向け
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/business-contact"
                      className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                      宿を掲載する
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <Heart className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  サポート
                </div>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/faq"
                      className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                      よくある質問
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                      お問い合わせ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                      利用規約
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors"
                    >
                      プライバシーポリシー
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Dog className="w-6 h-6 mr-2 text-[#FF5A5F]" />
                  <h3 className="font-bold text-white">SNS</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">愛犬との素敵な旅行をサポートします</p>
                <div className="flex space-x-3">
                  <a
                    href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300"
                  >
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                  <a
                    href="https://x.com/inutabi_biyori"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300"
                  >
                    <XIcon size={16} className="text-white" />
                  </a>
                  <a
                    href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4 text-white" />
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
              <p>© 2025 犬旅びより All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
            <p className="text-gray-600">ページを読み込み中...</p>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
