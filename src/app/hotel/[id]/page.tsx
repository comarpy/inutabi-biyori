'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Camera, Dog, Home, Info, CalendarCheck, MapPin, Phone, Car, CreditCard, Weight, Gift, Utensils, Building, Bed, Bath, UtensilsCrossed, X, ChevronLeft, ChevronRight, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { XIcon } from '../../../components/XIcon';

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

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
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

              </div>
            </div>

            {/* メイン写真と基本情報 */}
            <div className="p-6">
              <div className="flex gap-6 mb-8">
                {/* 画像エリア */}
                <div className="flex gap-4 w-1/2">
                  {/* メイン画像 */}
                  <div className="relative">
                    <img
                      src={hotel.images[selectedImageIndex]}
                      alt={hotel.name}
                      className="w-80 h-80 object-cover rounded-xl"
                    />
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-sm px-3 py-2 rounded-full flex items-center cursor-pointer hover:bg-opacity-80 transition-colors"
                         onClick={() => setIsImageModalOpen(true)}>
                      <Camera className="w-4 h-4 mr-2" />
                      写真 {hotel.images.length}枚
                    </div>
                  </div>
                  
                  {/* サムネイル */}
                  <div className="grid grid-cols-2 gap-3 h-80">
                    {hotel.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${hotel.name} 写真${index + 1}`}
                          className={`w-36 h-36 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedImageIndex === index 
                              ? 'border-2 border-[#FF5A5F] transform scale-105' 
                              : 'border-2 border-transparent hover:transform hover:scale-105'
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        />
                        {/* 4枚目で残り画像がある場合の表示 */}
                        {index === 3 && hotel.images.length > 4 && (
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-colors"
                            onClick={() => setIsImageModalOpen(true)}
                          >
                            <div className="text-white text-center">
                              <Camera className="w-6 h-6 mx-auto mb-1" />
                              <span className="text-sm font-medium">+{hotel.images.length - 4}枚</span>
                            </div>
                          </div>
                        )}
                      </div>
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
        </main>

        {/* 画像モーダル */}
        {isImageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full bg-white rounded-xl overflow-hidden">
              {/* モーダルヘッダー */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-bold">{hotel.name} - 写真ギャラリー</h3>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* 画像表示エリア */}
              <div className="p-4">
                <div className="relative mb-4">
                  <img
                    src={hotel.images[selectedImageIndex]}
                    alt={`${hotel.name} 写真${selectedImageIndex + 1}`}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                  
                  {/* 前の画像ボタン */}
                  {hotel.images.length > 1 && selectedImageIndex > 0 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* 次の画像ボタン */}
                  {hotel.images.length > 1 && selectedImageIndex < hotel.images.length - 1 && (
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* 画像番号表示 */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {hotel.images.length}
                  </div>
                </div>
                
                {/* サムネイル一覧 */}
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {hotel.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${hotel.name} サムネイル${index + 1}`}
                      className={`w-full h-16 object-cover rounded cursor-pointer transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-2 border-[#FF5A5F] transform scale-105' 
                          : 'border border-gray-200 hover:transform hover:scale-105 hover:border-[#FF5A5F]'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フッター */}
        <footer className="bg-gray-800 text-white mt-16 rounded-t-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-4 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                  利用規約
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li><Link href="/faq" className="cursor-pointer hover:text-white">よくある質問</Link></li>
                  <li><Link href="/privacy" className="cursor-pointer hover:text-white">プライバシーポリシー</Link></li>
                  <li><Link href="/terms" className="cursor-pointer hover:text-white">利用規約</Link></li>
                  <li><Link href="/contact" className="cursor-pointer hover:text-white">お問い合わせ</Link></li>
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
                  <a href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:text-[#FF5A5F]">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:text-[#FF5A5F]">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://x.com/inutabi_biyori" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:text-[#FF5A5F]">
                    <XIcon size={24} />
                  </a>
                  <div className="cursor-pointer hover:text-[#FF5A5F]">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
              <p className="flex items-center justify-center">
                <Dog className="w-4 h-4 mr-2" />
                © 2025 犬旅びより All Rights Reserved.
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