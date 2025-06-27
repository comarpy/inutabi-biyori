'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Camera, Dog, Home, Info, CalendarCheck, MapPin, Phone, Car, CreditCard, Weight, Gift, Utensils, Building, Bed, Bath, UtensilsCrossed } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import Link from 'next/link';
import { HotelDetail } from '@/lib/hotelService';

// 型定義
interface BookingSite {
  name: string;
  price: string;
  color: string;
}

function HotelDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const paramId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  useEffect(() => {
    const fetchHotelDetail = async () => {
      if (!paramId) {
        setError('ホテルIDが指定されていません');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`/api/hotel/${paramId}`);
        const data = await response.json();
        
        if (data.success) {
          setHotel(data.hotel);
        } else {
          setError(data.error || 'ホテルが見つかりません');
        }
      } catch (err) {
        console.error('ホテル詳細取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotelDetail();
  }, [paramId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">ホテル情報を取得中...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || '宿が見つかりません'}</h1>
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
        location: hotel.location,
        price: hotel.price,
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
                          <td className="py-2">{hotel.location}</td>
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
                    {hotel.dogFeatures.filter(feature => feature.available).map((feature, index) => {
                      // アイコンを名前に基づいて決定
                      const getIcon = (featureName: string) => {
                        if (featureName.includes('温泉')) return Bath;
                        if (featureName.includes('駐車場')) return Car;
                        if (featureName.includes('ごはん') || featureName.includes('メニュー')) return UtensilsCrossed;
                        return Dog; // デフォルトは犬アイコン
                      };
                      
                      const IconComponent = getIcon(feature.name);
                      
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

              {/* 追加情報・注意事項 */}
              {hotel.notes && (
                <div className="mb-8">
                  <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-4">
                    <Info className="w-6 h-6 mr-3 text-[#8B7355]" />
                    <h2 className="text-xl font-bold">注意事項・その他</h2>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-700">{hotel.notes}</p>
                  </div>
                </div>
              )}

              {/* 宿泊予約サイト */}
              <div className="bg-[#F9F6F2] rounded-xl p-6 border border-[#F0E8D8]">
                <div className="bg-[#F5F0E8] text-[#555555] p-4 rounded-xl border border-[#E8D5B7] flex items-center mb-6">
                  <CalendarCheck className="w-6 h-6 mr-3 text-[#8B7355]" />
                  <h2 className="text-xl font-bold">宿泊予約</h2>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {hotel.website && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 mr-4 text-sm font-bold text-gray-700 min-w-[100px] text-center">
                          公式サイト
                        </div>
                        <div>
                          <p className="font-bold text-base">公式予約</p>
                          <p className="text-sm text-gray-600">最新情報・最安値保証</p>
                        </div>
                      </div>
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center"
                      >
                        <Dog className="w-4 h-4 mr-1" />
                        公式へ
                      </a>
                    </div>
                  )}
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-lg px-4 py-2 mr-4 text-sm font-bold text-gray-700 min-w-[100px] text-center">
                        楽天トラベル
                      </div>
                      <div>
                        <p className="font-bold text-base">¥{hotel.price.toLocaleString()}〜</p>
                        <p className="text-sm text-gray-600">（税込）/泊</p>
                      </div>
                    </div>
                    <button className="bg-[#FF5A5F] hover:bg-[#FF385C] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center">
                      <Dog className="w-4 h-4 mr-1" />
                      予約へ
                    </button>
                  </div>
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

export default function HotelDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5A5F] mx-auto mb-4"></div>
          <p className="text-gray-600">ホテル情報を読み込み中...</p>
        </div>
      </div>
    }>
      <HotelDetailContent />
    </Suspense>
  );
}