'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Camera, Dog, Home, Info, CalendarCheck, MapPin, Phone, Car, CreditCard, Weight, Gift, Utensils, Building, Bed } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import Link from 'next/link';

// 型定義
interface DogFeature {
  name: string;
  icon: any;
}

interface PetInfo {
  sizes: string;
  maxPets: string;
  petFee: string;
  amenities: string;
}

interface BookingSite {
  name: string;
  price: string;
  color: string;
}

interface Hotel {
  id: number;
  name: string;
  address: string;
  access: string;
  checkin: string;
  checkout: string;
  parking: string;
  payment: string;
  phone: string;
  images: string[];
  dogFeatures: DogFeature[];
  petInfo: PetInfo;
  bookingSites: BookingSite[];
}

// サンプルホテルデータ（実際のアプリでは API から取得）
const hotelData: { [key: string]: Hotel } = {
  '1': {
    id: 1,
    name: 'ドッグヴィラ東京',
    address: '東京都中央区銀座5-6-7',
    access: '東京メトロ銀座駅から徒歩10分',
    checkin: '15:00 〜 19:00',
    checkout: '11:00まで',
    parking: 'あり（予約制・1泊¥2,000）',
    payment: 'クレジットカード、現金、電子マネー',
    phone: '03-1234-5678',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3'
    ],
    dogFeatures: [
      { name: '小型犬OK', icon: Dog },
      { name: '中型犬OK', icon: Dog },
      { name: '大型犬OK', icon: Dog },
      { name: '多頭OK', icon: Dog },
      { name: 'ドッグラン', icon: Dog },
      { name: '屋内ドッグラン', icon: Home },
      { name: 'お部屋にドッグラン', icon: Bed },
      { name: '館内リードでOK', icon: Building },
      { name: '一緒にごはんOK', icon: Utensils }
    ],
    petInfo: {
      sizes: '全サイズOK（小型犬・中型犬・大型犬）',
      maxPets: '1室につき最大3頭まで',
      petFee: '1泊1頭につき ¥5,000（税込）',
      amenities: 'ペットシーツ、タオル、食器、ベッド等'
    },
    bookingSites: [
      { name: '楽天トラベル', price: '¥32,300〜', color: 'red' },
      { name: 'じゃらん', price: '¥33,000〜', color: 'red' },
      { name: '一休.com', price: '¥35,000〜', color: 'red' },
      { name: '公式サイト', price: '公式予約', color: 'blue' }
    ]
  }
};

export default function HotelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!paramId) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">宿が見つかりません</h1>
          <Link href="/search" className="text-[#FF5A5F] hover:underline">
            検索結果に戻る
          </Link>
        </div>
      </div>
    );
  }
  
  const hotel = hotelData[paramId];

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">宿が見つかりません</h1>
          <Link href="/search" className="text-[#FF5A5F] hover:underline">
            検索結果に戻る
          </Link>
        </div>
      </div>
    );
  }

  const isHotelFavorite = isFavorite(hotel.id);

  const handleFavoriteToggle = () => {
    if (isHotelFavorite) {
      removeFromFavorites(hotel.id);
    } else {
      addToFavorites({
        id: hotel.id,
        name: hotel.name,
        location: hotel.address,
        price: 32300,
        amenities: [],
        image: hotel.images[0],
        coordinates: [35.6762, 139.7647] as [number, number]
      });
    }
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
              <button 
                onClick={() => router.back()}
                className="mr-4 hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Dog className="w-6 h-6 mr-2" />
              <span className="font-bold text-lg">犬と泊まれる宿</span>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/favorites" className="text-sm hover:text-gray-200 cursor-pointer flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                お気に入り
              </Link>
              <a className="text-sm hover:text-gray-200 cursor-pointer flex items-center">
                <Dog className="w-4 h-4 mr-1" />
                宿を掲載する
              </a>
              <a className="text-sm hover:text-gray-200 cursor-pointer">ログイン</a>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* ヘッダー情報 */}
            <div className="bg-[#F9F6F2] p-6 border-b border-[#F0E8D8]">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold flex items-center mb-2">
                    <Home className="w-8 h-8 mr-3 text-[#FF5A5F]" />
                    {hotel.name}
                  </h1>
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isHotelFavorite 
                      ? 'bg-[#FF5A5F] text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isHotelFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* メイン写真と基本情報 */}
            <div className="p-6">
              <div className="flex gap-6 mb-8">
                {/* メインビジュアル */}
                <div className="flex gap-4 w-1/2">
                  <div className="relative">
                    <img
                      src={hotel.images[selectedImageIndex]}
                      alt={hotel.name}
                      className="w-80 h-80 object-cover rounded-xl"
                    />
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-sm px-3 py-2 rounded-full flex items-center cursor-pointer hover:bg-opacity-80 transition-colors">
                      <Camera className="w-4 h-4 mr-2" />
                      写真をもっと見る
                    </div>
                  </div>
                  
                  {/* サムネイル */}
                  <div className="grid grid-cols-2 gap-3 h-80">
                    {hotel.images.slice(0, 4).map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${hotel.name} 写真${index + 1}`}
                        className={`w-36 h-36 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedImageIndex === index 
                            ? 'border-2 border-[#FF5A5F] transform scale-105' 
                            : 'border-2 border-transparent hover:transform hover:scale-105'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>

                {/* 基本情報 */}
                <div className="w-1/2">
                  <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-4">
                    <Info className="w-6 h-6 mr-3 text-[#8B7355]" />
                    <h2 className="text-xl font-bold">宿泊基本情報</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <table className="w-full text-sm">
                      <tbody className="space-y-3">
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600 w-24">住所</td>
                          <td className="py-2">{hotel.address}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">マップ</td>
                          <td className="py-2">
                            <a href="#" className="text-blue-600 hover:underline flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              地図を表示
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">アクセス</td>
                          <td className="py-2">{hotel.access}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">チェックイン</td>
                          <td className="py-2">{hotel.checkin} / {hotel.checkout}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">駐車場</td>
                          <td className="py-2 flex items-center">
                            <Car className="w-4 h-4 mr-1 text-gray-600" />
                            {hotel.parking}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">決済情報</td>
                          <td className="py-2 flex items-center">
                            <CreditCard className="w-4 h-4 mr-1 text-gray-600" />
                            {hotel.payment}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 font-medium text-gray-600">電話番号</td>
                          <td className="py-2 flex items-center">
                            <Phone className="w-4 h-4 mr-1 text-gray-600" />
                            {hotel.phone}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 犬対応情報 */}
              <div className="mb-8">
                <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-4">
                  <Dog className="w-6 h-6 mr-3 text-[#8B7355]" />
                  <h2 className="text-xl font-bold">犬対応情報</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.dogFeatures.map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <span
                          key={index}
                          className="bg-[#FFF0F0] text-[#FF5A5F] border border-[#FFE4E4] rounded-full px-4 py-2 text-sm font-medium flex items-center"
                        >
                          <IconComponent className="w-4 h-4 mr-2" />
                          {feature.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ペット宿泊情報 */}
              <div className="mb-8">
                <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-4">
                  <Dog className="w-6 h-6 mr-3 text-[#8B7355]" />
                  <h2 className="text-xl font-bold">ペット宿泊情報</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center">
                        <Weight className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                        宿泊可能サイズ
                      </h4>
                      <p className="text-sm text-gray-600">{hotel.petInfo.sizes}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center">
                        <Dog className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                        宿泊可能頭数
                      </h4>
                      <p className="text-sm text-gray-600">{hotel.petInfo.maxPets}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center">
                        <span className="text-[#FF5A5F] mr-2">¥</span>
                        ペット宿泊料金
                      </h4>
                      <p className="text-sm text-gray-600">{hotel.petInfo.petFee}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-bold text-gray-700 mb-2 text-sm flex items-center">
                        <Gift className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                        わんちゃん用アメニティ
                      </h4>
                      <p className="text-sm text-gray-600">{hotel.petInfo.amenities}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 宿泊予約サイト */}
              <div className="bg-[#F9F6F2] rounded-xl p-6 border border-[#F0E8D8]">
                <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-6">
                  <CalendarCheck className="w-6 h-6 mr-3 text-[#8B7355]" />
                  <h2 className="text-xl font-bold">宿泊予約サイト</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {hotel.bookingSites.map((site, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 mr-4 text-sm font-bold text-gray-700 min-w-[100px] text-center">
                          {site.name}
                        </div>
                        <div>
                          <p className="font-bold text-base">{site.price}</p>
                          {site.price.includes('¥') && (
                            <p className="text-sm text-gray-600">（税込）/泊</p>
                          )}
                        </div>
                      </div>
                      <button
                        className={`${
                          site.color === 'blue' 
                            ? 'bg-blue-500 hover:bg-blue-600' 
                            : 'bg-[#FF5A5F] hover:bg-[#FF385C]'
                        } text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center`}
                      >
                        <Dog className="w-4 h-4 mr-1" />
                        {site.name === '公式サイト' ? '公式へ' : '予約へ'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <footer className="bg-gray-800 text-white mt-16 rounded-t-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center">
                  <Dog className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  サービスについて
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="cursor-pointer hover:text-white">ご利用ガイド</li>
                  <li className="cursor-pointer hover:text-white">よくある質問</li>
                  <li className="cursor-pointer hover:text-white">お問い合わせ</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  利用規約
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="cursor-pointer hover:text-white">プライバシーポリシー</li>
                  <li className="cursor-pointer hover:text-white">特定商取引法</li>
                  <li className="cursor-pointer hover:text-white">キャンセルポリシー</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  運営会社
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="cursor-pointer hover:text-white">会社概要</li>
                  <li className="cursor-pointer hover:text-white">採用情報</li>
                  <li className="cursor-pointer hover:text-white">パートナー募集</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  SNSでフォロー
                </h3>
                <div className="flex space-x-4 text-xl">
                  <div className="cursor-pointer hover:text-[#FF5A5F]">📷</div>
                  <div className="cursor-pointer hover:text-[#FF5A5F]">📘</div>
                  <div className="cursor-pointer hover:text-[#FF5A5F]">🐦</div>
                  <div className="cursor-pointer hover:text-[#FF5A5F]">💬</div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
              <p className="flex items-center justify-center">
                <Dog className="w-4 h-4 mr-2" />
                © 2024 犬と泊まれる宿 All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 