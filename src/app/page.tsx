'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Hotel, House, Tent, Waves, Dog, Bone, Utensils, Heart, Play, ParkingCircle, Instagram, Facebook, ShoppingBag, GlassWater, TreePine, Camera } from 'lucide-react';
import { XIcon } from '../components/XIcon';

import type { DetailFilters } from '@/lib/hotelService';
import Link from 'next/link';

function HomeContent() {
  const router = useRouter();
  
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

  const [searchParams, setSearchParams] = useState({
    area: '全国',
    dogSize: '指定なし'
  });

  // 詳細条件のトグル
  const toggleDetailFilter = (filterKey: keyof typeof detailFilters) => {
    setDetailFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };

  const handleSearch = () => {
    console.log('検索実行:', searchParams, detailFilters);
    // 検索結果ページに遷移（パラメータ付き）
    const queryParams = new URLSearchParams({
      area: searchParams.area,
      dogSize: searchParams.dogSize,
      ...Object.fromEntries(
        Object.entries(detailFilters).filter(([_, value]) => value)
      )
    });
    router.push(`/search?${queryParams.toString()}`);
  };

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
          className="h-[650px] bg-green-400 bg-cover bg-center bg-no-repeat relative flex flex-col justify-between items-center p-10"
          style={{
            backgroundImage: "url('/images/画像2.jpeg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
              >
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
          
          {/* キャッチコピー */}
          <div className="relative z-10 text-center">
            <h1 
              className="text-5xl font-bold text-white mb-4"
              style={{
                textShadow: '0 0 20px rgba(255, 255, 255, 0.8), 0 0 30px rgba(255, 255, 255, 0.6), 0 0 40px rgba(255, 255, 255, 0.4), 2px 2px 4px rgba(0,0,0,0.7)'
              }}
              >
              愛犬との最高の旅を、ここから。
            </h1>
            </div>

          {/* 検索バー */}
          <div className="relative z-10 w-full max-w-4xl bg-white bg-opacity-95 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm text-gray-600 text-left mb-2">エリアを選択</label>
                <select 
                  className="w-full bg-transparent text-gray-800 border border-gray-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                  value={searchParams.area}
                  onChange={(e) => setSearchParams({...searchParams, area: e.target.value})}
                >
                  {prefectures.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 text-left mb-2">犬のサイズ</label>
                <select 
                  className="w-full bg-transparent text-gray-800 border border-gray-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-[#FF5A5F] focus:border-[#FF5A5F]"
                  value={searchParams.dogSize}
                  onChange={(e) => setSearchParams({...searchParams, dogSize: e.target.value})}
                >
                  <option>指定なし</option>
                  <option>小型犬</option>
                  <option>中型犬</option>
                  <option>大型犬OK</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white px-6 py-3 rounded-full font-semibold flex items-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <Search className="w-5 h-5 mr-2" />
                この条件で検索
                    </button>
            </div>
          </div>
        </section>

        {/* 詳細検索オプション */}
        <div className="bg-gray-50 p-3">
          <div className="max-w-7xl mx-auto flex justify-center space-x-4 text-sm flex-wrap gap-2">
            <button
              onClick={() => toggleDetailFilter('dogRun')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.dogRun
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Bone className="w-4 h-4 mr-2" />
              ドッグラン
            </button>
            <button
              onClick={() => toggleDetailFilter('largeDog')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.largeDog
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Dog className="w-4 h-4 mr-2" />
              大型犬OK
            </button>
            <button
              onClick={() => toggleDetailFilter('roomDining')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.roomDining
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Utensils className="w-4 h-4 mr-2" />
              部屋食あり
            </button>
            <button
              onClick={() => toggleDetailFilter('hotSpring')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.hotSpring
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Waves className="w-4 h-4 mr-2" />
              温泉
            </button>
            <button
              onClick={() => toggleDetailFilter('parking')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.parking
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <ParkingCircle className="w-4 h-4 mr-2" />
              駐車場あり
            </button>
            <button
              onClick={() => toggleDetailFilter('multipleDogs')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.multipleDogs
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Heart className="w-4 h-4 mr-2" />
              複数頭OK
            </button>
            <button
              onClick={() => toggleDetailFilter('petAmenities')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.petAmenities
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              ペット用品
            </button>
            <button
              onClick={() => toggleDetailFilter('dogMenu')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.dogMenu
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Bone className="w-4 h-4 mr-2" />
              犬用メニュー
            </button>
            <button
              onClick={() => toggleDetailFilter('privateBath')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.privateBath
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <GlassWater className="w-4 h-4 mr-2" />
              貸切風呂
            </button>
            <button
              onClick={() => toggleDetailFilter('roomDogRun')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.roomDogRun
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <TreePine className="w-4 h-4 mr-2" />
              客室ドッグラン
            </button>
            <button
              onClick={() => toggleDetailFilter('grooming')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.grooming
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Camera className="w-4 h-4 mr-2" />
              グルーミング
            </button>
            <button
              onClick={() => toggleDetailFilter('leashFree')}
              className={`flex items-center px-3 py-2 rounded-full transition-all duration-300 ${
                detailFilters.leashFree
                  ? 'bg-[#FF5A5F] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-[#FFF0F0] hover:text-[#FF5A5F] border border-gray-200'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              室内ノーリード
            </button>
            </div>
          </div>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* エリアから探す */}
          <section className="mb-12 p-3">
            <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-t-xl border border-[#E8D5B7] flex items-center shadow-md">
              <Heart className="w-6 h-6 mr-3 text-[#8B7355]" />
              <h2 className="text-xl font-bold">エリアから探す</h2>
                  </div>
            <div className="bg-white p-6 rounded-b-xl shadow-lg border border-t-0 border-[#E8D5B7]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold mb-3 text-base">人気エリア</h4>
                  <div className="flex flex-wrap">
                    {['北海道', '東京', '箱根', '伊豆', '軽井沢', '京都'].map((area) => (
                      <span 
                        key={area}
                        className="inline-flex items-center bg-[#F3F3F3] text-[#484848] rounded-full px-4 py-2 mr-2 mb-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-[#FF5A5F] hover:text-white hover:-translate-y-1 shadow-sm hover:shadow-md"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-3 text-base">宿タイプで探す</h4>
                  <div className="flex flex-wrap">
                    {[
                      {name: 'ホテル', icon: Hotel},
                      {name: '旅館', icon: House},
                      {name: 'コテージ', icon: Tent},
                      {name: '温泉宿', icon: Waves}
                    ].map(({name, icon: Icon}) => (
                      <span 
                        key={name}
                        className="inline-flex items-center bg-[#F3F3F3] text-[#484848] rounded-full px-4 py-2 mr-2 mb-2 text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-[#FF5A5F] hover:text-white hover:-translate-y-1 shadow-sm hover:shadow-md"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {name}
                      </span>
              ))}
            </div>
                </div>
              </div>
                </div>
          </section>

          {/* 特集記事 */}
          <section className="p-3">
            <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-t-xl border border-[#E8D5B7] flex items-center justify-between shadow-md">
              <div className="flex items-center">
                <Dog className="w-6 h-6 mr-3 text-[#8B7355]" />
                <h2 className="text-xl font-bold">特集記事</h2>
              </div>
              <div className="ml-auto">
                <a className="text-gray-600 text-sm font-normal hover:text-gray-800 cursor-pointer">
                  もっと見る →
                </a>
              </div>
            </div>
            <div className="bg-white p-6 rounded-b-xl shadow-lg border border-t-0 border-[#E8D5B7]">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    icon: Play,
                    title: '広々ドッグラン付き',
                    description: '愛犬と思いっきり遊べる宿'
                  },
                  {
                    icon: Dog,
                    title: '大型犬歓迎の宿',
                    description: '大きなワンちゃんもゆったり'
                  },
                  {
                    icon: Utensils,
                    title: '一緒に食事できる',
                    description: '愛犬と同じ部屋で食事を'
                  }
                ].map(({icon: Icon, title, description}) => (
                  <div 
                    key={title}
                    className="bg-white border-2 border-[#F0F0F0] rounded-lg p-3 flex items-center hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Icon className="w-8 h-8 mr-3 text-[#FF5A5F]" />
                    <div>
                      <h4 className="font-bold text-sm mb-1">{title}</h4>
                      <p className="text-xs text-gray-600">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* フッター */}
        <footer className="bg-[#3A3A3A] text-white mt-16 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Dog className="w-6 h-6 mr-2 text-[#FF5A5F]" />
                  <h3 className="font-bold text-white">Inutabi-biyori</h3>
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

              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  サービス
                </div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/search" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">宿を探す</Link></li>

                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">予約履歴</Link></li>
                </ul>
              </div>
              
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
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">よくある質問</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">お問い合わせ</Link></li>
                  <li><Link href="/terms" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">利用規約</Link></li>
                  <li><Link href="/privacy" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">プライバシーポリシー</Link></li>
                </ul>
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

