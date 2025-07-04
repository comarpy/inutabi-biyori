'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Dog, Building, Mail, Phone, MessageSquare, Heart, Info, Instagram, Facebook, X, MessageCircle } from 'lucide-react';

export default function BusinessContactPage() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    
    // TODO: Implement form submission logic
    console.log('Business contact form submitted:', formData);
    alert('お問い合わせを送信しました。3営業日以内にご連絡いたします。');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] relative">
      {/* 背景パターン */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
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

      <div className="max-w-7xl mx-auto relative z-10 p-4">
        <h1 className="text-3xl font-bold mb-4 text-[#484848]">宿泊施設・企業様向けお問い合わせ</h1>
        
        {/* ヘッダー部分 */}
        <div className="bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] text-white p-4 rounded-t-lg mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#FAF6F1] p-2 rounded-full mr-3 flex items-center justify-center w-15 h-15">
              <Dog className="w-8 h-8 text-[#FF5A5F]" />
            </div>
            <h2 className="text-xl font-bold">犬旅びより - 愛犬と泊まれる宿が見つかる、旅の検索サイト</h2>
          </div>
          <div className="text-lg font-medium">掲載・提携のお問い合わせ</div>
        </div>

        {/* コンテンツ部分 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          {/* セクション見出し */}
          <div className="bg-[#F5F0E8] text-[#555555] p-3 rounded-md mb-4 font-semibold flex items-center">
            <Building className="w-5 h-5 mr-2" />
            宿泊施設・企業様向けお問い合わせフォーム
          </div>

          {/* 説明文 */}
          <div className="mb-6">
            <p className="font-medium mb-2">「犬旅びより」への掲載をご希望の宿泊施設様、提携をご検討の企業様は、以下のフォームよりお問い合わせください。</p>
            <p className="font-medium mb-2">担当者より3営業日以内にご連絡いたします。</p>
            
            {/* Link to general contact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-gray-600 mb-2">一般的なお問い合わせの場合は：</p>
              <Link href="/contact" className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                一般お問い合わせフォームはこちら
              </Link>
            </div>
          </div>

          {/* お問い合わせフォーム */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium mb-1">
                宿泊施設名/企業名 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-md px-3 bg-gray-50 focus:outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-md px-3 bg-gray-50 focus:outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-md px-3 bg-gray-50 focus:outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20"
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20"
                required
              />
            </div>

            <div className="my-4">
              <label className="flex items-start cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mr-2 mt-1"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  required 
                />
                <span className="text-sm">
                  <Link href="/terms" className="text-red-500 hover:underline">利用規約</Link>
                  および
                  <Link href="/privacy" className="text-red-500 hover:underline">プライバシーポリシー</Link>
                  に同意します<span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            <div className="text-center">
              <button 
                type="submit"
                disabled={!isAgreed}
                className={`px-6 py-3 rounded-md font-medium text-white transition-all duration-300 flex items-center justify-center mx-auto ${
                  isAgreed 
                    ? 'bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] hover:from-[#FF7A7F] hover:to-[#FF587C] hover:-translate-y-0.5 hover:shadow-lg' 
                    : 'bg-gradient-to-r from-[#FF5A5F] to-[#FF385C] opacity-70 cursor-not-allowed'
                }`}
              >
                <Dog className="w-4 h-4 mr-2" />
                送信する
              </button>
            </div>
          </form>
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
  );
} 