'use client';

import { useState } from 'react';
import { Search, MapPin, Dog, Bone, Heart, X } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '../context/FavoritesContext';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, favoritesCount } = useFavorites();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const handleRemoveFavorite = (hotelId: number) => {
    removeFromFavorites(hotelId);
    setShowDeleteConfirm(null);
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
            <Link href="/" className="flex items-center hover:opacity-80">
              <Dog className="w-6 h-6 mr-2" />
                              <span className="font-bold text-lg">犬旅びより</span>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/favorites" className="text-sm hover:text-gray-200 cursor-pointer flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <Heart className="w-4 h-4 mr-1 fill-white" />
                お気に入り ({favoritesCount})
              </Link>
              <Link href="/contact" className="text-sm hover:text-gray-200 cursor-pointer">
                お問い合わせ
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
            <div className="p-6">
              {/* ページタイトル */}
              <div className="bg-gradient-to-r from-[#FFF0F0] to-[#FFE4E4] text-[#FF5A5F] p-6 rounded-lg mb-6 border border-[#FFD4D4]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="w-8 h-8 mr-3 fill-[#FF5A5F]" />
                    <div>
                      <h1 className="text-2xl font-bold mb-1">お気に入りの宿</h1>
                      <p className="text-sm opacity-80">あなたが保存したお気に入りの宿一覧</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{favoritesCount}</div>
                    <div className="text-sm opacity-80">件保存中</div>
                  </div>
                </div>
              </div>

              {/* お気に入りが空の場合 */}
              {favorites.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-600 mb-2">お気に入りがありません</h2>
                  <p className="text-gray-500 mb-6">気になる宿を♡ボタンで保存してみましょう</p>
                  <Link href="/" className="bg-[#FF5A5F] hover:bg-[#FF385C] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 inline-flex items-center">
                    <Search className="w-4 h-4 mr-2" />
                    宿を探す
                  </Link>
                </div>
              ) : (
                <>
                  {/* お気に入り一覧 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {favorites.map((hotel) => (
                      <div 
                        key={hotel.id}
                        className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 relative group"
                      >
                        {/* 削除ボタン */}
                        <button
                          onClick={() => setShowDeleteConfirm(hotel.id)}
                          className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* 削除確認モーダル */}
                        {showDeleteConfirm === hotel.id && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center z-20">
                            <div className="bg-white p-4 rounded-lg shadow-xl max-w-xs">
                              <h3 className="font-bold mb-2">お気に入りから削除</h3>
                              <p className="text-sm text-gray-600 mb-4">「{hotel.name}」をお気に入りから削除しますか？</p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleRemoveFavorite(hotel.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
                                >
                                  削除
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded text-sm font-medium"
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mb-3">
                          <div className="w-[100px] h-[100px] rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={hotel.image}
                              alt={hotel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {hotel.location}
                            </p>
                            <div className="flex mb-2">
                              {hotel.amenities.slice(0, 3).map((Icon, index) => (
                                <div 
                                  key={index}
                                  className="bg-[#FFF0F0] text-[#FF5A5F] rounded-full w-6 h-6 flex items-center justify-center mr-1"
                                >
                                  <Icon className="w-3 h-3" />
                                </div>
                              ))}
                              {hotel.amenities.length > 3 && (
                                <div className="text-xs text-gray-500 flex items-center ml-1">
                                  +{hotel.amenities.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#FF5A5F] text-lg">¥{hotel.price.toLocaleString()}〜</span>
                              <Link 
                                href={`/search?hotel=${hotel.id}`}
                                className="bg-[#FF5A5F] hover:bg-[#FF385C] text-white text-sm px-3 py-1 rounded-full transition-colors flex items-center"
                              >
                                <Heart className="w-3 h-3 mr-1" />
                                詳細
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* アクション */}
                  <div className="bg-[#F9F6F2] rounded-lg p-4 border border-[#F0E8D8] text-center">
                    <p className="text-gray-600 mb-4">他にも素敵な宿がたくさんあります</p>
                    <div className="flex justify-center space-x-4">
                      <Link href="/" className="bg-[#FF5A5F] hover:bg-[#FF385C] text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center">
                        <Search className="w-4 h-4 mr-2" />
                        もっと探す
                      </Link>
                      <Link href="/search" className="bg-white hover:bg-gray-50 text-[#FF5A5F] border-2 border-[#FF5A5F] px-6 py-2 rounded-full font-semibold transition-all duration-300 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        検索結果へ
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* フッター */}
              <footer className="bg-gray-800 text-white p-4 text-xs rounded-lg mt-6">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <h5 className="font-bold mb-2 flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      サービスについて
                    </h5>
                    <ul className="space-y-1 text-gray-300">
                      <li><Link href="/" className="hover:text-white cursor-pointer">ホーム</Link></li>
                      <li><Link href="/search" className="hover:text-white cursor-pointer">宿を探す</Link></li>
                      <li><Link href="/contact" className="hover:text-white cursor-pointer">お問い合わせ</Link></li>
                    </ul>
                  </div>
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
                      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-pink-600 transition-colors">
                        <span className="text-xs font-bold">I</span>
                      </a>
                      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                        <span className="text-xs font-bold">F</span>
                      </a>
                      <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors">
                        <span className="text-xs font-bold">T</span>
                      </a>
                      <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
                        <span className="text-xs font-bold">L</span>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="text-center text-gray-400 flex items-center justify-center">
                  <Heart className="w-3 h-3 mr-1" />
                                      © 2024 犬旅びより All Rights Reserved.
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 