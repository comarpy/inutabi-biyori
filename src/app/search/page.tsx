'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Dog,
  ArrowLeft,
  ArrowRight,
  Map as MapIcon,
  List,
  AlertCircle,
  ChevronDown,
  Settings2,
  Filter as FilterIcon,
  X,
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

// 地方区分: サイドバーに表示する単位
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

interface DetailFiltersState {
  dogRun: boolean;
  smallDog: boolean;
  mediumDog: boolean;
  largeDog: boolean;
  xlDog: boolean;
  hotSpring: boolean;
  privateBath: boolean;
  parking: boolean;
  multipleDogs: boolean;
  petAmenities: boolean;
  dogMenu: boolean;
  roomDining: boolean;
  roomDogRun: boolean;
  grooming: boolean;
  leashFree: boolean;
}

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
    privateBath: searchParams.get('privateBath') === 'true',
    parking: searchParams.get('parking') === 'true',
    multipleDogs: searchParams.get('multipleDogs') === 'true',
    petAmenities: searchParams.get('petAmenities') === 'true',
    dogMenu: searchParams.get('dogMenu') === 'true',
    roomDining: searchParams.get('roomDining') === 'true',
    roomDogRun: searchParams.get('roomDogRun') === 'true',
    grooming: searchParams.get('grooming') === 'true',
    leashFree: searchParams.get('leashFree') === 'true',
  });

  const [searchFilters, setSearchFilters] = useState({
    areas: searchParams.get('areas')?.split(',').filter(Boolean) || [],
  });

  const toggleDetailFilter = (key: keyof DetailFiltersState) => {
    setDetailFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRegion = (regionName: string) => {
    const region = REGIONS.find((r) => r.name === regionName);
    if (!region) return;
    const allSelected = region.areas.every((p) => searchFilters.areas.includes(p));
    setSearchFilters((prev) => ({
      ...prev,
      areas: allSelected
        ? prev.areas.filter((a) => !region.areas.includes(a))
        : Array.from(new Set([...prev.areas, ...region.areas])),
    }));
  };

  const clearAll = () => {
    setSearchFilters({ areas: [] });
    setDetailFilters({
      dogRun: false, smallDog: false, mediumDog: false, largeDog: false, xlDog: false,
      hotSpring: false, privateBath: false, parking: false, multipleDogs: false, petAmenities: false,
      dogMenu: false, roomDining: false, roomDogRun: false, grooming: false, leashFree: false,
    });
  };

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('人気順');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showSpFilters, setShowSpFilters] = useState(false);
  const PAGE_SIZE = 9;

  const searchHotels = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        areas: searchFilters.areas.join(','),
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

  // フィルタ変更時に自動で再検索（debounce 350ms）
  useEffect(() => {
    const t = setTimeout(() => {
      searchHotels();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(searchFilters), JSON.stringify(detailFilters)]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE));
    if (currentPage > total) setCurrentPage(total);
  }, [hotels, currentPage]);

  const handleHotelSelect = (hotel: Hotel) => {
    router.push(`/hotel/${hotel.id}`);
  };

  const activeFilterCount = Object.values(detailFilters).filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE));
  const visibleHotels = (hotels || []).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 選択中の地方表示用
  const selectedRegions = REGIONS.filter((r) =>
    r.areas.some((p) => searchFilters.areas.includes(p))
  );

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
            {selectedRegions.length === 0 && activeFilterCount === 0 ? (
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-pill)',
                  padding: '5px 12px',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}
              >
                すべての宿
              </span>
            ) : (
              <>
                {selectedRegions.map((r) => (
                  <span
                    key={r.name}
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
                    {r.name}
                  </span>
                ))}
                {activeFilterCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1.5"
                    style={{
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      borderRadius: 'var(--r-pill)',
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    条件 {activeFilterCount}件
                  </span>
                )}
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1"
                  style={{
                    fontSize: 11,
                    color: 'var(--text-soft)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  <X className="w-3 h-3" />
                  すべてクリア
                </button>
              </>
            )}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isLoading ? '検索中...' : `${(hotels || []).length}件`}
          </div>
        </div>
      </div>

      {/* ============== Main: Sidebar + Results ============== */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid gap-6 lg:gap-8" style={{ gridTemplateColumns: '1fr' }}>
          <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            {/* Sidebar (PC only) */}
            <aside
              className="hidden lg:block self-start"
              style={{ position: 'sticky', top: 16 }}
            >
              <div
                className="p-4"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: 'var(--sh-sm)',
                }}
              >
                <div className="text-[13px] font-bold mb-3" style={{ color: 'var(--text)' }}>
                  絞り込み
                </div>

                <FilterGroup title="エリア">
                  {REGIONS.map((r) => {
                    const active = r.areas.every((p) => searchFilters.areas.includes(p));
                    return (
                      <FilterCheckbox
                        key={r.name}
                        label={r.name}
                        checked={active}
                        onChange={() => toggleRegion(r.name)}
                      />
                    );
                  })}
                </FilterGroup>

                <FilterGroup title="犬のサイズ">
                  <FilterCheckbox label="小型犬" checked={detailFilters.smallDog} onChange={() => toggleDetailFilter('smallDog')} />
                  <FilterCheckbox label="中型犬" checked={detailFilters.mediumDog} onChange={() => toggleDetailFilter('mediumDog')} />
                  <FilterCheckbox label="大型犬" checked={detailFilters.largeDog} onChange={() => toggleDetailFilter('largeDog')} />
                  <FilterCheckbox label="超大型犬" checked={detailFilters.xlDog} onChange={() => toggleDetailFilter('xlDog')} />
                  <FilterCheckbox label="多頭OK" checked={detailFilters.multipleDogs} onChange={() => toggleDetailFilter('multipleDogs')} />
                </FilterGroup>

                <FilterGroup title="設備">
                  <FilterCheckbox label="ドッグラン" checked={detailFilters.dogRun} onChange={() => toggleDetailFilter('dogRun')} />
                  <FilterCheckbox label="客室ドッグラン" checked={detailFilters.roomDogRun} onChange={() => toggleDetailFilter('roomDogRun')} />
                  <FilterCheckbox label="温泉" checked={detailFilters.hotSpring} onChange={() => toggleDetailFilter('hotSpring')} />
                  <FilterCheckbox label="ペット同伴食事" checked={detailFilters.roomDining} onChange={() => toggleDetailFilter('roomDining')} />
                  <FilterCheckbox label="駐車場" checked={detailFilters.parking} onChange={() => toggleDetailFilter('parking')} />
                </FilterGroup>

                {(activeFilterCount > 0 || searchFilters.areas.length > 0) && (
                  <button
                    onClick={clearAll}
                    className="kt-btn kt-btn--ghost w-full mt-2"
                    style={{ padding: '8px 12px', fontSize: 12 }}
                  >
                    <X className="w-3.5 h-3.5" />
                    条件をリセット
                  </button>
                )}
              </div>
            </aside>

            {/* Right column: results */}
            <div>
              {/* SP: 絞り込みボタン */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowSpFilters((v) => !v)}
                  aria-expanded={showSpFilters}
                  className="w-full flex items-center justify-between"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '10px 14px',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                    絞り込み
                    {(activeFilterCount > 0 || searchFilters.areas.length > 0) && (
                      <span
                        className="px-2 py-0.5"
                        style={{
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          borderRadius: 'var(--r-pill)',
                          fontSize: 11,
                        }}
                      >
                        {activeFilterCount + selectedRegions.length}
                      </span>
                    )}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showSpFilters ? 'rotate-180' : ''}`}
                  />
                </button>
                {showSpFilters && (
                  <div
                    className="mt-3 p-4"
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-md)',
                    }}
                  >
                    <FilterGroup title="エリア">
                      {REGIONS.map((r) => {
                        const active = r.areas.every((p) => searchFilters.areas.includes(p));
                        return (
                          <FilterCheckbox key={r.name} label={r.name} checked={active} onChange={() => toggleRegion(r.name)} />
                        );
                      })}
                    </FilterGroup>
                    <FilterGroup title="犬のサイズ">
                      <FilterCheckbox label="小型犬" checked={detailFilters.smallDog} onChange={() => toggleDetailFilter('smallDog')} />
                      <FilterCheckbox label="中型犬" checked={detailFilters.mediumDog} onChange={() => toggleDetailFilter('mediumDog')} />
                      <FilterCheckbox label="大型犬" checked={detailFilters.largeDog} onChange={() => toggleDetailFilter('largeDog')} />
                      <FilterCheckbox label="超大型犬" checked={detailFilters.xlDog} onChange={() => toggleDetailFilter('xlDog')} />
                      <FilterCheckbox label="多頭OK" checked={detailFilters.multipleDogs} onChange={() => toggleDetailFilter('multipleDogs')} />
                    </FilterGroup>
                    <FilterGroup title="設備">
                      <FilterCheckbox label="ドッグラン" checked={detailFilters.dogRun} onChange={() => toggleDetailFilter('dogRun')} />
                      <FilterCheckbox label="客室ドッグラン" checked={detailFilters.roomDogRun} onChange={() => toggleDetailFilter('roomDogRun')} />
                      <FilterCheckbox label="温泉" checked={detailFilters.hotSpring} onChange={() => toggleDetailFilter('hotSpring')} />
                      <FilterCheckbox label="ペット同伴食事" checked={detailFilters.roomDining} onChange={() => toggleDetailFilter('roomDining')} />
                      <FilterCheckbox label="駐車場" checked={detailFilters.parking} onChange={() => toggleDetailFilter('parking')} />
                    </FilterGroup>
                  </div>
                )}
              </div>

              {/* Sort + view toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {visibleHotels.map((h, idx) => (
                      <HotelCard key={`${h.id}-${idx}`} hotel={h} layout="vert" />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div
                      className="flex justify-center items-center gap-2 mt-4 py-3"
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
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="mb-3 pb-3"
      style={{ borderBottom: '1px solid var(--line-soft)' }}
    >
      <div
        className="text-[11px] font-bold mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer py-1"
      style={{ fontSize: 12, color: checked ? 'var(--text)' : 'var(--text-muted)' }}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="form-checkbox h-4 w-4" />
      {label}
    </label>
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
