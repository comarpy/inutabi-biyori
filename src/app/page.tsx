'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Hotel, House, Tent, Waves, Dog, Bone, Utensils, Heart, Play, ParkingCircle, Instagram, Facebook, ShoppingBag, GlassWater, TreePine, Camera, ChevronDown, Calendar } from 'lucide-react';
import { XIcon } from '../components/XIcon';

import type { DetailFilters } from '@/lib/hotelService';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  
  // エリア階層データ構造（楽天トラベル方式）
  const areaData = {
    '全国': ['全国'],
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
    dogRun: false,
    largeDog: false,
    roomDining: false,
    hotSpring: false,
    parking: false,
    multipleDogs: false,
    petAmenities: false,
    dogMenu: false,
    privateBath: false,
    roomDogRun: false,
    grooming: false,
    leashFree: false
  });

  // 詳細フィルターの表示状態
  const [showDetailFilters, setShowDetailFilters] = useState(false);
  
  // エリア選択ドロップダウンの表示状態
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);

  const [searchParams, setSearchParams] = useState({
    areas: ['全国'] as string[],
    checkIn: '',
    checkOut: ''
  });

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showAreaDropdown && !target.closest('.area-dropdown-container')) {
        setShowAreaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAreaDropdown]);

  // 詳細条件のトグル
  const toggleDetailFilter = (filterKey: keyof typeof detailFilters) => {
    setDetailFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  // 詳細条件のクリア
  const clearDetailFilters = () => {
    setDetailFilters({
      dogRun: false,
      largeDog: false,
      roomDining: false,
      hotSpring: false,
      parking: false,
      multipleDogs: false,
      petAmenities: false,
      dogMenu: false,
      privateBath: false,
      roomDogRun: false,
      grooming: false,
      leashFree: false
    });
  };

  // エリア選択の処理
  const handleAreaToggle = (area: string) => {
    if (area === '全国') {
      setSearchParams(prev => ({
        ...prev,
        areas: prev.areas.includes('全国') ? ['全国'] : ['全国']
      }));
      return;
    }

    setSearchParams(prev => {
      const currentAreas = prev.areas.filter(a => a !== '全国');
      const isSelected = currentAreas.includes(area);
      
      if (isSelected) {
        const newAreas = currentAreas.filter(a => a !== area);
        return {
          ...prev,
          areas: newAreas.length === 0 ? ['全国'] : newAreas
        };
      } else {
        return {
          ...prev,
          areas: [...currentAreas, area]
        };
      }
    });
  };

  // 地方全選択の処理
  const handleRegionToggle = (region: string) => {
    const prefectures = areaData[region as keyof typeof areaData];
    if (!prefectures) return;

    const currentAreas = searchParams.areas.filter(a => a !== '全国');
    const allSelected = prefectures.every((pref: string) => currentAreas.includes(pref));

    if (allSelected) {
      // 全て選択済みの場合は全て解除
      const newAreas = currentAreas.filter(a => !prefectures.includes(a));
      setSearchParams(prev => ({
        ...prev,
        areas: newAreas.length === 0 ? ['全国'] : newAreas
      }));
    } else {
      // 一部または未選択の場合は全て選択
      const newAreas = [...new Set([...currentAreas, ...prefectures])];
      setSearchParams(prev => ({
        ...prev,
        areas: newAreas
      }));
    }
  };

  const handleSearch = () => {
    console.log('検索実行:', searchParams, detailFilters);
    
    // エリアが空の場合は全国を設定
    const areas = searchParams.areas.length > 0 ? searchParams.areas : ['全国'];
    
    // 検索結果ページに遷移（パラメータ付き）
    const queryParams = new URLSearchParams({
      areas: areas.join(','),
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      ...Object.fromEntries(
        Object.entries(detailFilters).filter(([_, value]) => value)
      )
    });
    
    console.log('検索パラメータ:', queryParams.toString());
    router.push(`/search?${queryParams.toString()}`);
  };

  // 日付のフォーマット関数
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}(${weekday})`;
  };

  const activeDetailCount = Object.values(detailFilters).filter(Boolean).length;



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
            <div className="flex items-center">
              <Dog className="w-6 h-6 mr-2" />
              <div className="flex flex-col">
                <span className="font-bold text-lg">犬旅びより</span>
                <span className="text-xs opacity-90">- 愛犬と泊まれる宿が見つかる、旅の検索サイト</span>
              </div>
            </div>
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

        {/* ヒーローエリア */}
        <section 
          className="h-[700px] bg-green-400 bg-cover bg-center bg-no-repeat relative flex flex-col justify-center items-center p-10"
          style={{
            backgroundImage: "url('/images/画像2.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
              >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          
          {/* キャッチコピー */}
          <div className="relative z-10 text-center mb-8">
            <h1 
              className="text-5xl font-bold text-white mb-4"
              style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 2px 2px 4px rgba(0,0,0,0.7)'
              }}
              >
              愛犬との最高の旅を、ここから。
            </h1>
            </div>

          {/* 検索バー - ヤフートラベル風シンプルデザイン */}
          <div className="relative z-10 w-full max-w-5xl bg-white bg-opacity-98 rounded-2xl shadow-2xl overflow-visible backdrop-blur-sm">
            {/* 検索フォームヘッダー */}
            <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white p-4 rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center justify-center">
                <Dog className="w-6 h-6 mr-3" />
                愛犬と泊まれる宿を検索
              </h2>
            </div>
            
            {/* メイン検索フォーム */}
            <div className="p-6 md:p-8">
              {/* 入力行（エリア + 日付 + ボタン） */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4">
                  {/* エリア */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-600 mb-2">エリア</label>
                    <div className="relative area-dropdown-container">
                      <button
                        type="button"
                        onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                        className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 text-gray-800 cursor-pointer hover:border-[#FF5A5F] transition-all duration-300 text-left flex items-center justify-between"
                      >
                        <span>
                          {searchParams.areas.length > 0 && !searchParams.areas.includes('') ? searchParams.areas.join(', ') : '全国'}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${showAreaDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showAreaDropdown && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[90vw] md:w-[48rem] max-w-[calc(100vw-2rem)] bg-white border-2 border-gray-300 rounded-xl shadow-2xl z-50 max-h-[32rem] flex flex-col">
                          <div className="flex-1 overflow-y-auto p-5">
                            <div className="mb-4 pb-4 border-b border-gray-200">
                              <label className="inline-flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors w-full">
                                <input
                                  type="checkbox"
                                  checked={searchParams.areas.includes('全国')}
                                  onChange={() => handleAreaToggle('全国')}
                                  className="form-checkbox h-5 w-5 text-[#FF5A5F] rounded focus:ring-[#FF5A5F] border-2 border-gray-300"
                                />
                                <span className="ml-3 text-base font-medium text-gray-800">全国</span>
                              </label>
                            </div>
                            <div className="space-y-3">
                              {Object.entries(areaData).map(([region, prefectures]) => {
                                if (region === '全国') return null;
                                const currentAreas = searchParams.areas.filter(a => a !== '全国');
                                const allSelected = prefectures.every((pref: string) => currentAreas.includes(pref));
                                const someSelected = prefectures.some((pref: string) => currentAreas.includes(pref));
                                return (
                                  <div key={region} className="border border-gray-100 rounded-lg p-3">
                                    <div className="mb-2">
                                      <label className="inline-flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors w-full">
                                        <input
                                          type="checkbox"
                                          checked={allSelected}
                                          ref={(el) => {
                                            if (el) el.indeterminate = someSelected && !allSelected;
                                          }}
                                          onChange={() => handleRegionToggle(region)}
                                          className="form-checkbox h-4 w-4 text-[#FF5A5F] rounded focus:ring-[#FF5A5F] border-2 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm font-bold text-[#FF5A5F]">{region}</span>
                                      </label>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pl-4">
                                      {prefectures.map((prefecture) => (
                                        <label key={prefecture} className="inline-flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 transition-colors">
                                          <input
                                            type="checkbox"
                                            checked={currentAreas.includes(prefecture)}
                                            onChange={() => handleAreaToggle(prefecture)}
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
                          <div className="flex-shrink-0 bg-gray-50 px-5 py-4 border-t border-gray-200 rounded-b-xl">
                            <div className="text-sm text-gray-600 mb-2 text-center">
                              選択中: {searchParams.areas.length > 0 && !searchParams.areas.includes('') ? searchParams.areas.join(', ') : '全国'}
                            </div>
                            <button
                              onClick={() => setShowAreaDropdown(false)}
                              className="w-full px-6 py-3 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#FF385C] transition-colors text-sm font-medium"
                            >
                              決定
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* チェックイン */}
                  <div className="flex-1 min-w-[220px]">
                    <label className="block text-sm font-medium text-gray-600 mb-2">チェックイン</label>
                    <input
                      type="date"
                      className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none text-gray-800 hover:border-[#FF5A5F] transition-colors"
                      value={searchParams.checkIn}
                      onChange={(e) => setSearchParams({...searchParams, checkIn: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {searchParams.checkIn && (
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {formatDate(searchParams.checkIn)}
                      </div>
                    )}
                  </div>

                  {/* チェックアウト */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600 mb-2">チェックアウト</label>
                    <input
                      type="date"
                      className="w-full h-14 px-4 text-base leading-6 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-200 appearance-none text-gray-800 hover:border-[#FF5A5F] transition-colors"
                      value={searchParams.checkOut}
                      onChange={(e) => setSearchParams({...searchParams, checkOut: e.target.value})}
                      min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                    />
                    {searchParams.checkOut && (
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {formatDate(searchParams.checkOut)}
                      </div>
                    )}
                  </div>

                  {/* 検索ボタン（行内右側） */}
                  <div className="flex-none self-end mt-6 sm:mt-0">
                    <button 
                      onClick={handleSearch}
                      className="h-14 px-6 text-base rounded-2xl bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white font-bold flex items-center justify-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      宿を検索する
                    </button>
                  </div>

                  {/* 検索ボタン（下段に移動のため削除） */}
                </div>
              </div>
              
              {/* 詳細フィルター展開ボタン（下段・元検索位置） */}
              <div className="mb-4 px-6">
                <div className="text-center">
                  <button
                    onClick={() => setShowDetailFilters(!showDetailFilters)}
                    aria-expanded={showDetailFilters}
                    className="inline-flex items-center h-12 px-5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-[#FF5A5F] hover:text-[#FF5A5F] transition-all"
                  >
                    <Bone className="w-4 h-4 mr-2" />
                    詳細条件{showDetailFilters ? '（閉じる）' : ''}
                  </button>
                </div>
              </div>

              

              {/* 検索条件サマリー */}
              <div className="mb-4 px-6">
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-3">
                    <span className="bg-white px-4 py-2 rounded-full border border-gray-300 shadow-sm font-medium">
                      📍 {searchParams.areas.length > 0 && !searchParams.areas.includes('') ? searchParams.areas.join(', ') : '全国'}
                    </span>
                    {(searchParams.checkIn && searchParams.checkOut) && (
                      <span className="bg-white px-4 py-2 rounded-full border border-gray-300 shadow-sm font-medium">
                        📅 {formatDate(searchParams.checkIn)} ～ {formatDate(searchParams.checkOut)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            
            </div>

            {/* 詳細フィルター（折りたたみ式） */}
            {showDetailFilters && (
              <div className="mb-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 shadow-inner">
                <h4 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  詳細条件で絞り込み
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.dogRun}
                      onChange={() => toggleDetailFilter('dogRun')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Bone className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">ドッグラン</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.largeDog}
                      onChange={() => toggleDetailFilter('largeDog')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Dog className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">大型犬OK</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.roomDining}
                      onChange={() => toggleDetailFilter('roomDining')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Utensils className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">部屋食あり</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.hotSpring}
                      onChange={() => toggleDetailFilter('hotSpring')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Waves className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">温泉</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.parking}
                      onChange={() => toggleDetailFilter('parking')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <ParkingCircle className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">駐車場あり</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.multipleDogs}
                      onChange={() => toggleDetailFilter('multipleDogs')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Heart className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">複数頭OK</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.petAmenities}
                      onChange={() => toggleDetailFilter('petAmenities')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <ShoppingBag className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">ペット用品</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.dogMenu}
                      onChange={() => toggleDetailFilter('dogMenu')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Bone className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">犬用メニュー</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.privateBath}
                      onChange={() => toggleDetailFilter('privateBath')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <GlassWater className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">貸切風呂</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.roomDogRun}
                      onChange={() => toggleDetailFilter('roomDogRun')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <TreePine className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">客室ドッグラン</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.grooming}
                      onChange={() => toggleDetailFilter('grooming')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Camera className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">グルーミング</span>
                  </label>

                  <label className="flex items-center space-x-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={detailFilters.leashFree}
                      onChange={() => toggleDetailFilter('leashFree')}
                      className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                    />
                    <Play className="w-4 h-4 text-[#FF5A5F]" />
                    <span className="text-xs font-medium text-gray-700">室内ノーリード</span>
                  </label>
                </div>
              </div>
            )}
            
            
          </div>
        </section>



        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* 余白のみ（不要セクション削除） */}
        </main>

        {/* フッター */}
        <footer className="bg-[#3A3A3A] text-white mt-16 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <Hotel className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  宿泊施設向け
                </div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/business-contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">宿を掲載する</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">管理画面</Link></li>
                </ul>
              </div>

              
              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <Heart className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  サポート
                </div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/faq" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">よくある質問</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">お問い合わせ</Link></li>
                  <li><Link href="/terms" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">利用規約</Link></li>
                  <li><Link href="/privacy" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">プライバシーポリシー</Link></li>
                </ul>
              </div>

              <div>
                <div className="flex items-center mb-4">
                  <Dog className="w-6 h-6 mr-2 text-[#FF5A5F]" />
                  <h3 className="font-bold text-white">SNS</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  愛犬との素敵な旅行をサポートします
                </p>
                <div className="flex space-x-3">
                  <a href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
                    <Facebook className="w-4 h-4 text-white" />
                  </a>
                  <a href="https://x.com/inutabi_biyori" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
                    <XIcon size={16} className="text-white" />
                  </a>
                  <a href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">ページを読み込み中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

