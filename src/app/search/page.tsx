'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, House, Waves, Dog, Bone, Car, Heart, ParkingCircle, ArrowLeft, ArrowRight, Map, SortAsc, Wifi, Camera, Laptop, Battery, ShoppingBag, Tv, TreePine, List, AlertCircle, Instagram, Facebook, MessageCircle, ChevronDown, Settings2, Star } from 'lucide-react';
import { XIcon } from '../../components/XIcon';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Hotel } from '../../lib/hotelService';
import type { DetailFilters } from '@/lib/hotelService';

// 地図コンポーネントを動的にインポート（SSRを無効化）
const HotelMap = dynamic(() => import('./components/HotelMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
        <p className="text-gray-600">地図を読み込み中...</p>
      </div>
    </div>
  )
});

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // エリア階層データ構造（楽天トラベル方式）
  const areaData = {
    '北海道': ['北海道'],
    '東北': ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
    '北関東': ['茨城県', '栃木県', '群馬県'],
    '首都圏': ['埼玉県', '千葉県', '東京都', '神奈川県'],
    '伊豆・箱根': ['静岡県（伊豆）', '神奈川県（箱根）'],
    '甲信越': ['山梨県', '長野県', '新潟県'],
    '北陸': ['富山県', '石川県', '福井県'],
    '東海': ['岐阜県', '静岡県', '愛知県'],
    '近畿': ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
    '中国': ['鳥取県', '島根県', '岡山県', '広島県', '山口県'],
    '四国': ['徳島県', '香川県', '愛媛県', '高知県'],
    '九州': ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県'],
    '沖縄': ['沖縄県']
  };

  // 詳細条件の状態
  const [detailFilters, setDetailFilters] = useState({
    dogRun: searchParams.get('dogRun') === 'true',
    smallDog: searchParams.get('smallDog') === 'true',
    mediumDog: searchParams.get('mediumDog') === 'true',
    largeDog: searchParams.get('largeDog') === 'true',
    hotSpring: searchParams.get('hotSpring') === 'true',
    parking: searchParams.get('parking') === 'true',
    multipleDogs: searchParams.get('multipleDogs') === 'true',
    petAmenities: searchParams.get('petAmenities') === 'true',
    dogMenu: searchParams.get('dogMenu') === 'true',
    roomDogRun: searchParams.get('roomDogRun') === 'true',
    grooming: searchParams.get('grooming') === 'true'
  });
  
  const [searchFilters, setSearchFilters] = useState({
    areas: searchParams.get('areas')?.split(',') || [],
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || ''
  });

  // 詳細条件のトグル
  const toggleDetailFilter = (filterKey: keyof typeof detailFilters) => {
    setDetailFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('人気順');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const PAGE_SIZE = 9;
  const [showDetailFilters, setShowDetailFilters] = useState(false);

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

  // 検索実行
  const searchHotels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 詳細条件をクエリパラメータに追加
      const queryParams = new URLSearchParams({
        areas: searchFilters.areas.join(','),
        checkinDate: searchFilters.checkIn,
        checkoutDate: searchFilters.checkOut,
        ...Object.fromEntries(
          Object.entries(detailFilters).filter(([_, value]) => value)
        )
      });
      
      const response = await fetch(`/api/search-hotels?${queryParams.toString()}`);
      const data = await response.json();

      if (data.success && data.hotels) {
        const hotelsArray = Array.isArray(data.hotels) ? data.hotels : [];
        setHotels(hotelsArray);
      } else {
        setError(data.error || '検索に失敗しました');
        setHotels([]);
      }
    } catch (err) {
      console.error('検索エラー:', err);
      setError('データの取得に失敗しました');
      setHotels([]); // エラー時は空配列を設定
    } finally {
      setIsLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    searchHotels();
  }, []);

  // 総ページ数の変化に合わせて現在ページを補正
  useEffect(() => {
    const total = Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE));
    if (currentPage > total) {
      setCurrentPage(total);
    }
  }, [hotels, currentPage]);

  const handleSearch = () => {
    console.log('再検索実行:', searchFilters);
    if (searchFilters.areas.length === 0) {
      alert('エリアを選択してください');
      return;
    }
    searchHotels();
  };

  const handleHotelSelect = (hotel: Hotel) => {
    console.log('選択された宿:', hotel);
    router.push(`/hotel/${hotel.id}`);
  };



  const activeFilters = [
    { icon: MapPin, label: searchFilters.areas.length > 0 ? searchFilters.areas.join(', ') : '全国' },
  ];

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
            backgroundRepeat: 'repeat'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* ヘッダー */}
        <header className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80">
              <Dog className="w-6 h-6 mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">犬旅びより</span>
                <span className="text-xs opacity-90">- 愛犬と泊まれる宿が見つかる、旅の検索サイト</span>
              </div>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/contact" className="text-sm hover:text-gray-200 cursor-pointer">
                お問い合わせ
              </Link>
              <Link href="/business-contact" className="text-sm hover:text-gray-200 cursor-pointer flex items-center">
                <Dog className="w-4 h-4 mr-1" />
                宿を掲載する
              </Link>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-4">
              {/* 検索結果ヘッダー */}
              <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-lg mb-4 flex items-center border border-[#E8D5B7] shadow-md">
                <Heart className="w-5 h-5 mr-2 text-[#8B7355]" />
                <h1 className="text-lg font-bold">
                  {isLoading ? '検索中...' : `検索結果 ${hotels ? hotels.length : 0}件`}
                </h1>
              </div>

              {/* 再検索フォーム */}
              <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
                <div className="flex flex-wrap items-center gap-4 mb-3">
                  <div className="flex-1 relative area-dropdown-container">
                    <label className="block text-sm text-gray-600 mb-2">選択中のエリア</label>
                    <button
                      type="button"
                      onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                      className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm text-left flex items-center justify-between"
                    >
                      <span className="text-gray-700 flex-1 min-w-0 truncate">
                        {searchFilters.areas.length > 0 ? searchFilters.areas.join(', ') : 'エリアを選択してください'}
                      </span>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showAreaDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showAreaDropdown && (
                        <div className="absolute top-full left-0 translate-x-0 mt-2 w-[min(90vw,64rem)] max-w-[calc(100vw-2rem)] bg-white border-2 border-gray-300 rounded-xl shadow-2xl z-50 max-h-[70vh] flex flex-col">
                        <div className="flex-1 overflow-y-auto p-4">
                          <div className="space-y-3">
                            {Object.entries(areaData).map(([region, prefectures]) => {
                              const currentAreas = searchFilters.areas;
                              const allSelected = prefectures.every((pref: string) => currentAreas.includes(pref));
                              const someSelected = prefectures.some((pref: string) => currentAreas.includes(pref));
                              return (
                                <div key={region} className="border border-gray-100 rounded-lg p-3">
                                  <div className="mb-2">
                                    <label className="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors w-full">
                                      <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                        onChange={() => {
                                          const prefecturesList = areaData[region as keyof typeof areaData] || [];
                                          const current = searchFilters.areas;
                                          const nowAll = prefecturesList.every(p => current.includes(p));
                                          const next = nowAll ? current.filter(a => !prefecturesList.includes(a)) : [...new Set([...current, ...prefecturesList])];
                                          setSearchFilters(prev => ({...prev, areas: next}));
                                        }}
                                        className="form-checkbox h-4 w-4 text-[#FF5A5F] rounded focus:ring-[#FF5A5F] border-2 border-gray-300"
                                      />
                                      <span className="ml-2 text-sm font-bold text-[#FF5A5F]">{region}</span>
                                    </label>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 pl-4">
                                    {prefectures.map((prefecture) => (
                                      <label key={prefecture} className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors">
                                        <input
                                          type="checkbox"
                                          checked={currentAreas.includes(prefecture)}
                                          onChange={() => {
                                            const current = searchFilters.areas;
                                            const isSel = current.includes(prefecture);
                                            const next = isSel ? current.filter(a => a !== prefecture) : [...current, prefecture];
                                            setSearchFilters(prev => ({...prev, areas: next}));
                                          }}
                                          className="form-checkbox h-3 w-3 text-[#FF5A5F] rounded focus:ring-[#FF5A5F] border-2 border-gray-300"
                                        />
                                        <span className="ml-2 text-xs text-gray-700">{prefecture}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex-shrink-0 bg-gray-50 px-4 py-3 border-t border-gray-200 rounded-b-xl">
                          <div className="text-sm text-gray-600 mb-2 text-center break-words">選択中: {searchFilters.areas.length > 0 ? searchFilters.areas.join(', ') : 'エリアを選択してください'}</div>
                          <button onClick={() => { setShowAreaDropdown(false); searchHotels(); }} className="w-full px-6 py-2 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#FF385C] transition-colors text-sm font-medium">決定</button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">チェックイン</label>
                    <input
                      type="date"
                      className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none"
                      value={searchFilters.checkIn}
                      onChange={(e) => setSearchFilters({...searchFilters, checkIn: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm text-gray-600 mb-2">チェックアウト</label>
                    <input
                      type="date"
                      className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none"
                      value={searchFilters.checkOut}
                      onChange={(e) => setSearchFilters({...searchFilters, checkOut: e.target.value})}
                      min={searchFilters.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex-none">
                    <button 
                      onClick={handleSearch}
                      className="h-14 px-6 text-base rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-300 flex items-center"
                    >
                      <Dog className="w-4 h-4 mr-2" />
                      再検索
                    </button>
                  </div>
                </div>
                
                {/* 詳細条件（折りたたみ） */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowDetailFilters(prev => !prev)}
                    aria-expanded={showDetailFilters}
                    className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 px-3 py-2 shadow-sm hover:border-[#FF5A5F] transition-all"
                  >
                    <span className="flex items-center text-sm font-medium text-gray-700">
                      <Settings2 className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                      詳細条件
                      {Object.values(detailFilters).filter(Boolean).length > 0 && (
                        <span className="ml-2 text-xs bg-[#FFF0F0] text-[#FF5A5F] px-2 py-0.5 rounded-full border border-[#FFE4E4]">
                          {Object.values(detailFilters).filter(Boolean).length}
                        </span>
                      )}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDetailFilters ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showDetailFilters ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.dogRun}
                        onChange={() => toggleDetailFilter('dogRun')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Bone className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">ドッグラン</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.smallDog}
                        onChange={() => toggleDetailFilter('smallDog')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Dog className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">小型犬OK</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.mediumDog}
                        onChange={() => toggleDetailFilter('mediumDog')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Dog className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">中型犬OK</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.largeDog}
                        onChange={() => toggleDetailFilter('largeDog')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Dog className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">大型犬OK</span>
                    </label>

                    

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.hotSpring}
                        onChange={() => toggleDetailFilter('hotSpring')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Waves className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">温泉</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.parking}
                        onChange={() => toggleDetailFilter('parking')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <ParkingCircle className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">駐車場あり</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.multipleDogs}
                        onChange={() => toggleDetailFilter('multipleDogs')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Heart className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">複数頭OK</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.petAmenities}
                        onChange={() => toggleDetailFilter('petAmenities')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <ShoppingBag className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">ペット用品</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.dogMenu}
                        onChange={() => toggleDetailFilter('dogMenu')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Bone className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">犬用メニュー</span>
                    </label>

                    

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.roomDogRun}
                        onChange={() => toggleDetailFilter('roomDogRun')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <TreePine className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">客室ドッグラン</span>
                    </label>

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.grooming}
                        onChange={() => toggleDetailFilter('grooming')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Camera className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">グルーミング</span>
                    </label>
                    </div>
                  </div>
                </div>
                
                
              </div>

              {/* 並び替えとフィルター */}
              <div className="bg-[#F9F6F2] rounded-lg p-3 mb-4 border border-[#F0E8D8]">
                <div className="flex flex-wrap items-center gap-4 justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                      <SortAsc className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">並び替え:</span>
                    </div>
                    <select 
                      className="h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option>人気順</option>
                      <option>宿泊価格順</option>
                      <option>新着順</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    {activeFilters.map(({icon: Icon, label}, index) => (
                      <span 
                        key={index}
                        className="bg-[#FFF0F0] text-[#FF5A5F] rounded-full px-3 py-1 text-sm font-medium flex items-center border border-[#FFE4E4]"
                      >
                        <Icon className="w-3 h-3 mr-1" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 表示切り替えボタン */}
              <div className="bg-[#F9F6F2] rounded-lg p-3 mb-4 border border-[#F0E8D8]">
                <div className="flex justify-between items-center">
                  <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                        viewMode === 'list'
                          ? 'bg-[#FF5A5F] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List className="w-4 h-4 mr-2" />
                      リスト表示
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center ${
                        viewMode === 'map'
                          ? 'bg-[#FF5A5F] text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      地図表示
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    表示中: <span className="font-semibold text-[#FF5A5F]">{hotels ? hotels.length : 0}</span>件
                  </div>
                </div>
              </div>

              {/* 表示エリア */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
                  <p className="text-gray-600">検索中...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={searchHotels}
                    className="bg-[#FF5A5F] text-white px-6 py-2 rounded-full hover:bg-[#FF385C] transition-colors"
                  >
                    再試行
                  </button>
                </div>
              ) : !hotels || hotels.length === 0 ? (
                <div className="text-center py-12">
                  <Dog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">該当する宿泊施設が見つかりませんでした</p>
                  <p className="text-sm text-gray-500">検索条件を変更してお試しください</p>
                </div>
              ) : viewMode === 'list' ? (
                <>
                  {/* 宿泊施設一覧 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {(hotels || []).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((hotel, hotelIndex) => (
                      <Link
                        key={`hotel-${hotel.id}-${hotelIndex}`}
                        href={`/hotel/${hotel.id}`}
                        prefetch
                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 relative block"
                      >


                        <div className="flex gap-3 mb-3">
                          <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={hotel.image}
                              alt={hotel.name}
                              fill
                              sizes="120px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">{hotel.location}</p>
                            {hotel.reviewAverage ? (
                              <div className="flex items-center text-xs text-gray-700 mb-1">
                                <Star className="w-3.5 h-3.5 mr-1 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold">{hotel.reviewAverage.toFixed(1)}</span>
                                {hotel.reviewCount ? (
                                  <span className="ml-1 text-gray-500">({hotel.reviewCount}件)</span>
                                ) : null}
                              </div>
                            ) : null}
                            {(hotel.smallDog || hotel.mediumDog || hotel.largeDog) ? (
                              <div className="flex gap-1 mb-2">
                                {hotel.smallDog && (
                                  <span className="bg-[#FFF8E7] text-[#B8860B] border border-[#F0E0B0] rounded px-1.5 py-0.5 text-[10px] font-medium">小型</span>
                                )}
                                {hotel.mediumDog && (
                                  <span className="bg-[#FFF0E0] text-[#D2691E] border border-[#F0D5B0] rounded px-1.5 py-0.5 text-[10px] font-medium">中型</span>
                                )}
                                {hotel.largeDog && (
                                  <span className="bg-[#FFE4E4] text-[#C43939] border border-[#F0B5B5] rounded px-1.5 py-0.5 text-[10px] font-medium">大型</span>
                                )}
                              </div>
                            ) : null}
                                                        <div className="flex flex-wrap gap-1 mb-2">
                              {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.slice(0, 4).map((amenity, amenityIndex) => {
                                if (typeof amenity !== 'string') return null;
                                return (
                                  <div
                                    key={`amenity-${hotelIndex}-${amenityIndex}`}
                                    className="bg-[#FFF0F0] text-[#FF5A5F] rounded-full px-2 py-1 text-xs"
                                  >
                                    {amenity}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#FF5A5F]">¥{hotel.price.toLocaleString()}〜</span>
                              <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full group-hover:bg-red-600 transition-colors flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                詳細
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* ページネーション */}
                  {Math.ceil((hotels || []).length / PAGE_SIZE) > 1 && (
                    <div className="bg-[#F9F6F2] rounded-lg p-4 mb-4 border border-[#F0E8D8]">
                      <div className="flex justify-center items-center space-x-2">
                        <button 
                          className={`px-3 py-1 border border-gray-300 rounded text-sm bg-white transition-colors ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE)) }, (_, i) => i + 1).map((page) => (
                          <button 
                            key={page}
                            className={`px-3 py-1 rounded text-sm transition-colors ${
                              currentPage === page 
                                ? 'bg-red-500 text-white' 
                                : 'border border-gray-300 bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        ))}
                        <button 
                          className={`px-3 py-1 border border-gray-300 rounded text-sm bg-white transition-colors ${currentPage === Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                          onClick={() => currentPage < Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE)) && setCurrentPage(currentPage + 1)}
                          disabled={currentPage === Math.max(1, Math.ceil((hotels || []).length / PAGE_SIZE))}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* 地図表示 */
                <div className="mb-6">
                  <HotelMap hotels={hotels || []} onHotelSelect={handleHotelSelect} />
                </div>
              )}

              {/* フッター */}
              <footer className="bg-gray-800 text-white p-4 text-xs rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Bone className="w-3 h-3 mr-1" />
                      利用規約
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li><Link href="/faq" className="hover:text-white cursor-pointer">よくある質問</Link></li>
                      <li><Link href="/privacy" className="hover:text-white cursor-pointer">プライバシーポリシー</Link></li>
                      <li><Link href="/terms" className="hover:text-white cursor-pointer">利用規約</Link></li>
                      <li><Link href="/contact" className="hover:text-white cursor-pointer">お問い合わせ</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Dog className="w-3 h-3 mr-1" />
                      運営会社
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li><a href="https://comarpy.co.jp" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">会社概要</a></li>
                      <li><Link href="/business-contact" className="hover:text-white cursor-pointer">パートナー募集</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      SNSでフォロー
                    </h5>
                    <div className="flex space-x-3 text-base">
                      <a href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-pink-500 hover:text-pink-300 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                                                                   <a href="https://x.com/inutabi_biyori" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-blue-400 hover:text-blue-300 transition-colors">
                        <XIcon size={16} />
                      </a>
                      <a href="#" className="text-green-500 hover:text-green-400 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-400 flex items-center justify-center">
                  <Heart className="w-3 h-3 mr-1" />
                  © 2025 犬旅びより All Rights Reserved.
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">ページを読み込み中...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}