'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Hotel as HotelIcon, House, Tent, Waves, Dog, Bone, Utensils, Car, Heart, Calendar, Users, BedDouble, Play, ParkingCircle, ArrowLeft, ArrowRight, Map, SortAsc, Wifi, Camera, Laptop, Battery, ShoppingBag, Tv, GlassWater, TreePine, List, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useFavorites } from '../context/FavoritesContext';
import type { Hotel } from '../context/FavoritesContext';

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

export default function SearchResultsPage() {
  const router = useRouter();
  const { addToFavorites, removeFromFavorites, isFavorite, favoritesCount } = useFavorites();
  
  const [searchParams, setSearchParams] = useState({
    area: '東京',
    checkinDate: '2024-03-15',
    duration: '1泊2日',
    dogSize: '小型犬',
    guests: '2名',
    rooms: '1室',
    accommodationType: 'すべて'
  });

  const [sortBy, setSortBy] = useState('人気順');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const handleSearch = () => {
    console.log('再検索実行:', searchParams);
  };

  const handleHotelSelect = (hotel: Hotel) => {
    console.log('選択された宿:', hotel);
    router.push(`/hotel/${hotel.id}`);
  };

  const handleFavoriteToggle = (hotel: Hotel, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isFavorite(hotel.id)) {
      removeFromFavorites(hotel.id);
    } else {
      addToFavorites(hotel);
    }
  };

  const hotels: Hotel[] = [
    {
      id: 1,
      name: '東京ドッグヴィラ',
      location: '東京都・品川区',
      price: 28000,
      amenities: [Play, Utensils, ParkingCircle],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.6284, 139.7387] as [number, number]
    },
    {
      id: 2,
      name: '渋谷ペットホテル',
      location: '東京都・渋谷区',
      price: 32500,
      amenities: [Play, Waves, Wifi],
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.6581, 139.7014] as [number, number]
    },
    {
      id: 3,
      name: '新宿ワンコイン',
      location: '東京都・新宿区',
      price: 25800,
      amenities: [Dog, Utensils, Car],
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.6938, 139.7036] as [number, number]
    },
    {
      id: 4,
      name: '銀座ペットパレス',
      location: '東京都・中央区',
      price: 45000,
      amenities: [Play, Heart, Waves],
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.6762, 139.7647] as [number, number]
    },
    {
      id: 5,
      name: '浅草ドッグイン',
      location: '東京都・台東区',
      price: 22000,
      amenities: [House, Utensils, ParkingCircle],
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.7148, 139.7967] as [number, number]
    },
    {
      id: 6,
      name: '上野アニマルイン',
      location: '東京都・台東区',
      price: 26500,
      amenities: [TreePine, Play, Camera],
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.7142, 139.7753] as [number, number]
    },
    {
      id: 7,
      name: '池袋ペットスイート',
      location: '東京都・豊島区',
      price: 29800,
      amenities: [ShoppingBag, Utensils, Tv],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.7295, 139.7109] as [number, number]
    },
    {
      id: 8,
      name: '秋葉原テックイン',
      location: '東京都・千代田区',
      price: 31200,
      amenities: [Laptop, Wifi, Battery],
      image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.7022, 139.7731] as [number, number]
    },
    {
      id: 9,
      name: '六本木ラグジュアリー',
      location: '東京都・港区',
      price: 58000,
      amenities: [GlassWater, Waves, Heart],
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      coordinates: [35.6627, 139.7314] as [number, number]
    }
  ];

  const activeFilters = [
    { icon: MapPin, label: '東京' },
    { icon: Dog, label: '小型犬' },
    { icon: Heart, label: '複数頭OK' },
    { icon: Play, label: 'ドッグラン有' },
    { icon: Heart, label: 'ペット同伴OK' }
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
              <span className="font-bold text-lg">犬と泊まれる宿</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/favorites" className="text-sm hover:text-gray-200 cursor-pointer flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                お気に入り ({favoritesCount})
              </Link>
              <a className="text-sm hover:text-gray-200 cursor-pointer flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                宿を掲載する
              </a>
              <a className="text-sm hover:text-gray-200 cursor-pointer">ログイン</a>
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
                <h1 className="text-lg font-bold">検索結果 42件</h1>
              </div>

              {/* 再検索フォーム */}
              <div className="bg-white bg-opacity-95 rounded-xl shadow-lg p-4 mb-4 border border-gray-100">
                <div className="grid grid-cols-7 gap-2 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">エリア</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.area}
                      onChange={(e) => setSearchParams({...searchParams, area: e.target.value})}
                    >
                      <option>東京</option>
                      <option>神奈川</option>
                      <option>千葉</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">宿泊日</label>
                    <input 
                      type="date" 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.checkinDate}
                      onChange={(e) => setSearchParams({...searchParams, checkinDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">宿泊日数</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.duration}
                      onChange={(e) => setSearchParams({...searchParams, duration: e.target.value})}
                    >
                      <option>1泊2日</option>
                      <option>2泊3日</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">犬のサイズ</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.dogSize}
                      onChange={(e) => setSearchParams({...searchParams, dogSize: e.target.value})}
                    >
                      <option>小型犬</option>
                      <option>中型犬</option>
                      <option>大型犬</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">宿泊人数</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.guests}
                      onChange={(e) => setSearchParams({...searchParams, guests: e.target.value})}
                    >
                      <option>2名</option>
                      <option>3名</option>
                      <option>4名</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">部屋数</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.rooms}
                      onChange={(e) => setSearchParams({...searchParams, rooms: e.target.value})}
                    >
                      <option>1室</option>
                      <option>2室</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">宿タイプ</label>
                    <select 
                      className="w-full bg-white border border-gray-200 rounded p-2 text-sm focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                      value={searchParams.accommodationType}
                      onChange={(e) => setSearchParams({...searchParams, accommodationType: e.target.value})}
                    >
                      <option>すべて</option>
                      <option>ホテル</option>
                      <option>旅館</option>
                    </select>
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
                    表示中: <span className="font-semibold text-[#FF5A5F]">{hotels.length}</span>件
                  </div>
                </div>
              </div>

              {/* 表示エリア */}
              {viewMode === 'list' ? (
                <>
                  {/* 宿泊施設一覧 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {hotels.map((hotel) => (
                      <div 
                        key={hotel.id}
                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 relative"
                        onClick={() => handleHotelSelect(hotel)}
                      >
                        {/* お気に入りボタン */}
                        <button
                          onClick={(e) => handleFavoriteToggle(hotel, e)}
                          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                            isFavorite(hotel.id)
                              ? 'bg-[#FF5A5F] text-white hover:bg-[#FF385C]'
                              : 'bg-white bg-opacity-90 text-gray-600 hover:bg-red-50 hover:text-[#FF5A5F]'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(hotel.id) ? 'fill-white' : ''}`} />
                        </button>

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
                              {hotel.amenities.map((Icon, index) => (
                                <div 
                                  key={index}
                                  className="bg-[#FFF0F0] text-[#FF5A5F] rounded-full w-6 h-6 flex items-center justify-center mr-1"
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              ))}
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
                  <HotelMap hotels={hotels} onHotelSelect={handleHotelSelect} />
                </div>
              )}

              {/* フッター */}
              <footer className="bg-gray-800 text-white p-4 text-xs rounded-lg">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      サービスについて
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li className="hover:text-white cursor-pointer">ご利用ガイド</li>
                      <li className="hover:text-white cursor-pointer">よくある質問</li>
                      <li className="hover:text-white cursor-pointer">お問い合わせ</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Bone className="w-3 h-3 mr-1" />
                      利用規約
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li className="hover:text-white cursor-pointer">プライバシーポリシー</li>
                      <li className="hover:text-white cursor-pointer">特定商取引法</li>
                      <li className="hover:text-white cursor-pointer">キャンセルポリシー</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Dog className="w-3 h-3 mr-1" />
                      運営会社
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li className="hover:text-white cursor-pointer">会社概要</li>
                      <li className="hover:text-white cursor-pointer">採用情報</li>
                      <li className="hover:text-white cursor-pointer">パートナー募集</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      SNSでフォロー
                    </h5>
                    <div className="flex space-x-3 text-base">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">
                        <span className="text-xs font-bold">I</span>
                      </div>
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                        <span className="text-xs font-bold">F</span>
                      </div>
                      <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                        <span className="text-xs font-bold">T</span>
                      </div>
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                        <span className="text-xs font-bold">L</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-400 flex items-center justify-center">
                  <Heart className="w-3 h-3 mr-1" />
                  © 2024 犬と泊まれる宿 All Rights Reserved.
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}