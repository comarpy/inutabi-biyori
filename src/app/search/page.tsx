'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Waves,
  Dog,
  Bone,
  Heart,
  ParkingCircle,
  ArrowLeft,
  ArrowRight,
  Map as MapIcon,
  List,
  AlertCircle,
  ChevronDown,
  Settings2,
  Search,
  ShoppingBag,
  TreePine,
  Camera,
  Filter as FilterIcon,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Hotel } from '@/lib/hotelService';

import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';
import HotelCard from '@/components/site/HotelCard';

const HotelMap = dynamic(() => import('./components/HotelMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full flex items-center justify-center"
      style={{
        height: 600,
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-md)',
      }}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-10 w-10 mx-auto mb-3"
          style={{
            borderBottom: '2px solid var(--primary)',
            borderLeft: '2px solid transparent',
            borderRight: '2px solid transparent',
            borderTop: '2px solid transparent',
          }}
        />
        <p style={{ color: 'var(--text-muted)' }}>地図を読み込み中...</p>
      </div>
    </div>
  ),
});

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

interface DetailFilterDef {
  key: keyof DetailFiltersState;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

interface DetailFiltersState {
  dogRun: boolean;
  smallDog: boolean;
  mediumDog: boolean;
  largeDog: boolean;
  xlDog: boolean;
  hotSpring: boolean;
  parking: boolean;
  multipleDogs: boolean;
  petAmenities: boolean;
  dogMenu: boolean;
  roomDining: boolean;
  roomDogRun: boolean;
  grooming: boolean;
}

const DETAIL_FILTERS: DetailFilterDef[] = [
  { key: 'dogRun', label: 'ドッグラン', icon: Bone },
  { key: 'smallDog', label: '小型犬OK', icon: Dog },
  { key: 'mediumDog', label: '中型犬OK', icon: Dog },
  { key: 'largeDog', label: '大型犬OK', icon: Dog },
  { key: 'hotSpring', label: '温泉', icon: Waves },
  { key: 'parking', label: '駐車場あり', icon: ParkingCircle },
  { key: 'multipleDogs', label: '複数頭OK', icon: Heart },
  { key: 'petAmenities', label: 'ペット用品', icon: ShoppingBag },
  { key: 'dogMenu', label: '犬用メニュー', icon: Bone },
  { key: 'roomDogRun', label: '客室ドッグラン', icon: TreePine },
  { key: 'grooming', label: 'グルーミング', icon: Camera },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [detailFilters, setDetailFilters] = useState<DetailFiltersState>({
    dogRun: searchParams.get('dogRun') === 'true',
    smallDog: searchParams.get('smallDog') === 'true',
    mediumDog: searchParams.get('mediumDog') === 'true',
    largeDog: searchParams.get('largeDog') === 'true',
    xlDog: searchParams.get('xlDog') === 'true',
    hotSpring: searchParams.get('hotSpring') === 'true',
    parking: searchParams.get('parking') === 'true',
    multipleDogs: searchParams.get('multipleDogs') === 'true',
    petAmenities: searchParams.get('petAmenities') === 'true',
    dogMenu: searchParams.get('dogMenu') === 'true',
    roomDining: searchParams.get('roomDining') === 'true',
    roomDogRun: searchParams.get('roomDogRun') === 'true',
    grooming: searchParams.get('grooming') === 'true',
  });

  const [searchFilters, setSearchFilters] = useState({
    areas: searchParams.get('areas')?.split(',').filter(Boolean) || [],
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
  });

  const toggleDetailFilter = (key: keyof DetailFiltersState) => {
    setDetailFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('人気順');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showDetailFilters, setShowDetailFilters] = useState(false);
  const PAGE_SIZE = 9;

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

  const searchHotels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        areas: searchFilters.areas.join(','),
        checkinDate: searchFilters.checkIn,
        checkoutDate: searchFilters.checkOut,
        ...Object.fromEntries(
          Object.entries(detailFilters).filter(([, value]) => value)
        ),
      });

      const response = await fetch(`/api/search-hotels?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success && data.hotels) {
        setHotels(Array.isArray(data.hotels) ? data.hotels : []);
      } else {
        setError(data.error || '検索に失敗しました');
        setHotels([]);
      }
    } catch (err) {
      console.error('検索エラー:', err);
      setError('データの取得に失敗しました');
      setHotels([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { searchHotels(); }, []);

  useEffect(() => {
    const total = Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE));
    if (currentPage > total) setCurrentPage(total);
  }, [hotels, currentPage]);

  const handleSearch = () => searchHotels();

  const handleHotelSelect = (hotel: Hotel) => {
    router.push(`/hotel/${hotel.id}`);
  };

  const activeFilterCount = Object.values(detailFilters).filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE));
  const visibleHotels = (hotels || []).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader />

      {/* ============== Current filters bar ============== */}
      <div
        className="px-4 md:px-8 py-3"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-3">
          <div
            className="flex items-center gap-2 flex-shrink-0"
            style={{ color: 'var(--text-soft)', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}
          >
            <FilterIcon className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            現在の検索条件
          </div>
          <div className="flex-1 flex gap-2 flex-wrap items-center">
            <span
              className="inline-flex items-center gap-1.5"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-pill)',
                padding: '5px 12px',
                fontSize: 12,
              }}
            >
              <span style={{ fontSize: 10, color: 'var(--text-soft)' }}>エリア:</span>
              <span style={{ fontWeight: 600 }}>
                {searchFilters.areas.length > 0 ? searchFilters.areas.join(', ') : '全国'}
              </span>
            </span>
            {activeFilterCount > 0 && (
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  background: 'var(--primary-soft)',
                  color: 'var(--primary)',
                  borderRadius: 'var(--r-pill)',
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                条件 {activeFilterCount}件
              </span>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isLoading ? '検索中...' : `${(hotels || []).length}件`}
          </div>
        </div>
      </div>

      {/* ============== Main ============== */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr' }}>
          {/* Re-search box */}
          <div
            className="p-4 md:p-5"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              boxShadow: 'var(--sh-sm)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end">
              <div className="relative area-dropdown-container">
                <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>
                  選択中のエリア
                </label>
                <button
                  type="button"
                  onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                  className="w-full flex items-center justify-between"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '11px 14px',
                    fontSize: 14,
                    color: 'var(--text)',
                    height: 44,
                  }}
                >
                  <span className="flex-1 min-w-0 truncate text-left">
                    {searchFilters.areas.length > 0 ? searchFilters.areas.join(', ') : 'エリアを選択'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-soft)' }}
                  />
                </button>

                {showAreaDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-[min(90vw,52rem)] max-w-[calc(100vw-2rem)] z-50 max-h-[70vh] flex flex-col"
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
                          const currentAreas = searchFilters.areas;
                          const allSelected = prefectures.every((p) => currentAreas.includes(p));
                          const someSelected = prefectures.some((p) => currentAreas.includes(p));
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
                                  onChange={() => {
                                    const list = AREA_DATA[region];
                                    const current = searchFilters.areas;
                                    const nowAll = list.every((p) => current.includes(p));
                                    const next = nowAll
                                      ? current.filter((a) => !list.includes(a))
                                      : Array.from(new Set([...current, ...list]));
                                    setSearchFilters((prev) => ({ ...prev, areas: next }));
                                  }}
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
                                      checked={searchFilters.areas.includes(pref)}
                                      onChange={() => {
                                        const current = searchFilters.areas;
                                        const next = current.includes(pref)
                                          ? current.filter((a) => a !== pref)
                                          : [...current, pref];
                                        setSearchFilters((prev) => ({ ...prev, areas: next }));
                                      }}
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
                        onClick={() => { setShowAreaDropdown(false); searchHotels(); }}
                        className="kt-btn kt-btn--primary w-full"
                        style={{ padding: '9px 0', fontSize: 13 }}
                      >
                        決定
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>チェックイン</label>
                <input
                  type="date"
                  className="w-full"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '11px 12px',
                    fontSize: 13,
                    color: 'var(--text)',
                    height: 44,
                  }}
                  value={searchFilters.checkIn}
                  onChange={(e) => setSearchFilters({ ...searchFilters, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-[11px] mb-1" style={{ color: 'var(--text-soft)' }}>チェックアウト</label>
                <input
                  type="date"
                  className="w-full"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '11px 12px',
                    fontSize: 13,
                    color: 'var(--text)',
                    height: 44,
                  }}
                  value={searchFilters.checkOut}
                  onChange={(e) => setSearchFilters({ ...searchFilters, checkOut: e.target.value })}
                  min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
                />
              </div>
              <button
                onClick={handleSearch}
                className="kt-btn kt-btn--primary"
                style={{ height: 44, padding: '0 22px', fontSize: 14 }}
              >
                <Search className="w-4 h-4" />
                再検索
              </button>
            </div>

            {/* Detail filters toggle */}
            <div className="mt-4">
              <button
                onClick={() => setShowDetailFilters((v) => !v)}
                aria-expanded={showDetailFilters}
                className="w-full flex items-center justify-between transition-colors"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '9px 14px',
                  color: 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                  詳細条件
                  {activeFilterCount > 0 && (
                    <span
                      className="px-2 py-0.5"
                      style={{
                        background: 'var(--primary-soft)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--r-pill)',
                        fontSize: 11,
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showDetailFilters ? 'rotate-180' : ''}`}
                />
              </button>

              {showDetailFilters && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                  {DETAIL_FILTERS.map(({ key, label, icon: Icon }) => {
                    const active = detailFilters[key];
                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer transition-all"
                        style={{
                          background: active ? 'var(--primary-soft)' : 'var(--surface)',
                          border: `1px solid ${active ? 'var(--primary)' : 'var(--line)'}`,
                          borderRadius: 'var(--r-sm)',
                          padding: '9px 12px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleDetailFilter(key)}
                          className="form-checkbox w-4 h-4"
                        />
                        <Icon
                          className="w-4 h-4"
                          style={{ color: active ? 'var(--primary)' : 'var(--text-soft)' }}
                        />
                        <span
                          className="text-[13px] font-medium"
                          style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sort + view toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>並び順:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                <option>人気順</option>
                <option>宿泊価格順</option>
                <option>新着順</option>
              </select>
            </div>
            <div
              className="inline-flex p-1"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {([
                { key: 'list' as const, icon: List, label: 'リスト' },
                { key: 'map' as const, icon: MapIcon, label: '地図' },
              ]).map(({ key, icon: Icon, label }) => {
                const active = viewMode === key;
                return (
                  <button
                    key={key}
                    onClick={() => setViewMode(key)}
                    className="inline-flex items-center gap-1.5 transition-all"
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--r-xs)',
                      background: active ? 'var(--primary)' : 'transparent',
                      color: active ? 'var(--on-primary)' : 'var(--text-muted)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-16">
              <div
                className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
                style={{
                  borderBottom: '2px solid var(--primary)',
                  borderLeft: '2px solid transparent',
                  borderRight: '2px solid transparent',
                  borderTop: '2px solid transparent',
                }}
              />
              <p style={{ color: 'var(--text-muted)' }}>検索中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--primary)' }} />
              <p className="mb-4" style={{ color: 'var(--text)' }}>{error}</p>
              <button onClick={searchHotels} className="kt-btn kt-btn--primary">再試行</button>
            </div>
          ) : !hotels || hotels.length === 0 ? (
            <div className="text-center py-16">
              <Dog className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-soft)' }} />
              <p style={{ color: 'var(--text-muted)' }}>該当する宿が見つかりませんでした</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-soft)' }}>
                検索条件を変更してお試しください
              </p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleHotels.map((h, idx) => (
                  <HotelCard key={`${h.id}-${idx}`} hotel={h} layout="vert" />
                ))}
              </div>

              {totalPages > 1 && (
                <div
                  className="flex justify-center items-center gap-2 mt-2 py-4"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-md)',
                  }}
                >
                  <button
                    disabled={currentPage === 1}
                    onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                    className="inline-flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      color: currentPage === 1 ? 'var(--text-soft)' : 'var(--text-muted)',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--r-sm)',
                        background: currentPage === p ? 'var(--primary)' : 'var(--surface)',
                        color: currentPage === p ? 'var(--on-primary)' : 'var(--text)',
                        border: `1px solid ${currentPage === p ? 'var(--primary)' : 'var(--line)'}`,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                    className="inline-flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      color: currentPage === totalPages ? 'var(--text-soft)' : 'var(--text-muted)',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div>
              <HotelMap hotels={hotels || []} onHotelSelect={handleHotelSelect} />
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export default function SearchResultsPage() {
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
      <SearchContent />
    </Suspense>
  );
}
