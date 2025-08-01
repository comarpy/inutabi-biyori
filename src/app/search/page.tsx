'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, House, Waves, Dog, Bone, Utensils, Car, Heart, Play, ParkingCircle, ArrowLeft, ArrowRight, Map, SortAsc, Wifi, Camera, Laptop, Battery, ShoppingBag, Tv, GlassWater, TreePine, List, AlertCircle, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { XIcon } from '../../components/XIcon';
import Link from 'next/link';
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
  
  // 都道府県リスト
  const prefectures = [
    '全国',
    '北海道',
    '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  // 詳細条件の状態
  const [detailFilters, setDetailFilters] = useState({
    dogRun: searchParams.get('dogRun') === 'true',
    largeDog: searchParams.get('largeDog') === 'true',
    roomDining: searchParams.get('roomDining') === 'true',
    hotSpring: searchParams.get('hotSpring') === 'true',
    parking: searchParams.get('parking') === 'true',
    multipleDogs: searchParams.get('multipleDogs') === 'true',
    petAmenities: searchParams.get('petAmenities') === 'true',
    dogMenu: searchParams.get('dogMenu') === 'true',
    privateBath: searchParams.get('privateBath') === 'true',
    roomDogRun: searchParams.get('roomDogRun') === 'true',
    grooming: searchParams.get('grooming') === 'true',
    leashFree: searchParams.get('leashFree') === 'true'
  });
  
  const [searchFilters, setSearchFilters] = useState({
    area: searchParams.get('area') || '全国',
    dogSize: searchParams.get('dogSize') || '指定なし'
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

  // 検索実行
  const searchHotels = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 詳細条件をクエリパラメータに追加
      const queryParams = new URLSearchParams({
        area: searchFilters.area,
        dogSize: searchFilters.dogSize,
        ...Object.fromEntries(
          Object.entries(detailFilters).filter(([_, value]) => value)
        )
      });
      
      const response = await fetch(`/api/search-hotels?${queryParams.toString()}`);
      const data = await response.json();
      
      console.log('APIレスポンス:', data);
      console.log('hotels配列:', data.hotels);
      console.log('hotels配列の型:', typeof data.hotels);
      console.log('hotels配列かどうか:', Array.isArray(data.hotels));
      
      if (data.success && data.hotels) {
        // データが配列であることを確認
        const hotelsArray = Array.isArray(data.hotels) ? data.hotels : [];
        console.log('設定するhotels:', hotelsArray);
        if (hotelsArray.length > 0) {
          console.log('最初のホテルのamenities:', hotelsArray[0]?.amenities);
          console.log('amenitiesの型:', typeof hotelsArray[0]?.amenities);
          console.log('amenitiesは配列か:', Array.isArray(hotelsArray[0]?.amenities));
        }
        setHotels(hotelsArray);
      } else {
        console.log('APIエラーまたはhotelsが存在しない:', data);
        setError(data.error || '検索に失敗しました');
        setHotels([]); // エラー時は空配列を設定
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

  const handleSearch = () => {
    console.log('再検索実行:', searchFilters);
    searchHotels();
  };

  const handleHotelSelect = (hotel: Hotel) => {
    console.log('選択された宿:', hotel);
    router.push(`/hotel/${hotel.id}`);
  };



  const activeFilters = [
    { icon: MapPin, label: searchFilters.area },
    ...(searchFilters.dogSize !== '指定なし' ? [{ icon: Dog, label: searchFilters.dogSize }] : []),
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
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">エリア</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchFilters.area}
                      onChange={(e) => setSearchFilters({...searchFilters, area: e.target.value})}
                    >
                      {prefectures.map((prefecture) => (
                        <option key={prefecture} value={prefecture}>
                          {prefecture}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">犬のサイズ</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchFilters.dogSize}
                      onChange={(e) => setSearchFilters({...searchFilters, dogSize: e.target.value})}
                    >
                      <option>指定なし</option>
                      <option>小型犬</option>
                      <option>中型犬</option>
                      <option>大型犬</option>
                    </select>
                  </div>
                </div>
                
                {/* 詳細条件 */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-3">詳細条件</label>
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
                        checked={detailFilters.roomDining}
                        onChange={() => toggleDetailFilter('roomDining')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Utensils className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">部屋食あり</span>
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
                        checked={detailFilters.privateBath}
                        onChange={() => toggleDetailFilter('privateBath')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <GlassWater className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">貸切風呂</span>
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

                    <label className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-[#FFF0F0] hover:border-[#FF5A5F] transition-all duration-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={detailFilters.leashFree}
                        onChange={() => toggleDetailFilter('leashFree')}
                        className="w-4 h-4 text-[#FF5A5F] bg-gray-100 border-gray-300 rounded focus:ring-[#FF5A5F] focus:ring-2"
                      />
                      <Play className="w-4 h-4 text-[#FF5A5F]" />
                      <span className="text-sm font-medium text-gray-700">室内ノーリード</span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button 
                    onClick={handleSearch}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center"
                  >
                    <Dog className="w-4 h-4 mr-2" />
                    再検索
                  </button>
                </div>
              </div>

              {/* 並び替えとフィルター */}
              <div className="bg-[#F9F6F2] rounded-lg p-3 mb-4 border border-[#F0E8D8]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      <SortAsc className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">並び替え:</span>
                    </div>
                    <select 
                      className="border border-gray-200 rounded p-2 text-sm bg-white focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
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
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {hotels && hotels.map((hotel, hotelIndex) => (
                      <div 
                        key={`hotel-${hotel.id}-${hotelIndex}`}
                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 relative"
                        onClick={() => handleHotelSelect(hotel)}
                      >


                        <div className="flex gap-3 mb-3">
                          <div className="w-[120px] h-[120px] rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{hotel.location}</p>
                                                        <div className="flex mb-2">
                              {hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.map((amenity, amenityIndex) => {
                                // デバッグ: amenityの型を確認
                                console.log('amenity:', amenity, 'type:', typeof amenity);
                                
                                // amenityが文字列でない場合はスキップ
                                if (typeof amenity !== 'string') {
                                  console.warn('amenityが文字列ではありません:', amenity);
                                  return null;
                                }
                                
                                return (
                                  <div
                                    key={`amenity-${hotelIndex}-${amenityIndex}`}
                                    className="bg-[#FFF0F0] text-[#FF5A5F] rounded-full px-2 py-1 text-xs mr-1"
                                  >
                                    {amenity}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#FF5A5F]">¥{hotel.price.toLocaleString()}〜</span>
                              <button className="bg-red-500 text-white text-sm px-3 py-1 rounded-full hover:bg-red-600 transition-colors flex items-center">
                                <Heart className="w-3 h-3 mr-1" />
                                詳細
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ページネーション */}
                  <div className="bg-[#F9F6F2] rounded-lg p-4 mb-4 border border-[#F0E8D8]">
                    <div className="flex justify-center items-center space-x-2">
                      <button 
                        className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      {[1, 2, 3, 4, 5].map((page) => (
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
                        className="px-3 py-1 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 transition-colors"
                        onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* 地図表示 */
                <div className="mb-6">
                  <HotelMap hotels={hotels || []} onHotelSelect={handleHotelSelect} />
                </div>
              )}

              {/* フッター */}
              <footer className="bg-gray-800 text-white p-4 text-xs rounded-lg">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Bone className="w-3 h-3 mr-1" />
                      利用規約
                    </h5>
                    <ul className="space-y-1 text-gray-300">
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
                      <li><Link href="/contact" className="hover:text-white cursor-pointer">会社概要</Link></li>
                      <li><Link href="/contact" className="hover:text-white cursor-pointer">採用情報</Link></li>
                      <li><Link href="/contact" className="hover:text-white cursor-pointer">パートナー募集</Link></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      SNSでフォロー
                    </h5>
                    <div className="flex space-x-3 text-base">
                      <a href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-300 transition-colors">
                        <Instagram className="w-4 h-4" />
                      </a>
                      <a href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                        <Facebook className="w-4 h-4" />
                      </a>
                                                                   <a href="https://x.com/inutabi_biyori" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
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