'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Dog, AlertTriangle, RefreshCw, Home, Heart, Info, Building, Instagram, Facebook, X, MessageCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>犬旅びより - 500 Internal Server Error</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-[#FAF6F1] text-[#484848] relative">
        <div className="w-full max-w-7xl mx-auto min-h-screen relative overflow-visible">
          {/* 背景パターン */}
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-15 pointer-events-none"
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
          
          <div className="relative z-10 p-4">
            {/* ヘッダー部分 */}
            <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white p-4 rounded-t-lg mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-[#FAF6F1] p-2 rounded-full mr-3 flex items-center justify-center w-15 h-15">
                  <Dog className="w-8 h-8 text-[#FF5A5F]" />
                </div>
                <h2 className="text-xl font-bold">犬旅びより - 愛犬と泊まれる宿が見つかる、旅の検索サイト</h2>
              </div>
              <div className="text-lg font-medium">サーバーエラーが発生しました</div>
            </div>
            
            {/* コンテンツ部分 */}
            <div className="bg-white p-8 mb-4 text-center rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-6 text-[#FF5A5F] flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 mr-3" />
                サーバーエラーが発生しました
              </h2>
              
              <p className="text-lg mb-8 text-gray-600 leading-relaxed">
                申し訳ございません。一時的なサーバーエラーが発生しています。<br />
                しばらく経ってから再度アクセスしていただくか、以下のボタンからトップページにお戻りください。
              </p>
              
              <div className="mb-8">
                <img 
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" 
                  alt="困った表情の可愛い犬" 
                  className="mx-auto rounded-lg shadow-md max-h-60 object-cover"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 mb-6">
                <button
                  onClick={reset}
                  className="bg-[#FF5A5F] hover:bg-[#FF385C] text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg inline-flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  再試行
                </button>
                <Link 
                  href="/" 
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg inline-flex items-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  トップページに戻る
                </Link>
              </div>
              
              <div className="mt-6 text-gray-600">
                <p>
                  エラーが続く場合は、
                  <Link href="/contact" className="text-[#FF5A5F] hover:underline ml-1">
                    お問い合わせ
                  </Link>
                  からご連絡ください。
                </p>
              </div>
              
              {/* デバッグ情報（開発時のみ表示） */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    エラー詳細（開発時のみ表示）
                  </summary>
                  <pre className="text-sm text-gray-600 overflow-auto">
                    {error.message}
                    {error.stack && (
                      <>
                        <br />
                        <br />
                        {error.stack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </div>

            {/* フッター */}
            <footer className="bg-gray-800 text-white p-8 rounded-b-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Dog className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                    サービスについて
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li><Link href="#" className="hover:text-white transition-colors">ご利用ガイド</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">よくある質問</Link></li>
                    <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Info className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                    利用規約
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                    <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">特定商取引法</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-[#FF5A5F]" />
                    運営会社
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li><Link href="#" className="hover:text-white transition-colors">会社概要</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">採用情報</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">パートナー募集</Link></li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-400" />
                    SNSでフォロー
                  </h3>
                  <div className="flex space-x-4 text-xl">
                    <Link href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-300 transition-colors">
                      <Instagram className="w-6 h-6" />
                    </Link>
                    <Link href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                      <Facebook className="w-6 h-6" />
                    </Link>
                                         <Link href="https://x.com/inutabi_biyori" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                       <X className="w-6 h-6" />
                     </Link>
                    <Link href="#" className="text-green-500 hover:text-green-400 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-600 text-sm text-center text-gray-400">
                <p className="flex items-center justify-center">
                  <Dog className="w-4 h-4 mr-2" />
                  © 2025 犬旅びより All Rights Reserved.
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
} 