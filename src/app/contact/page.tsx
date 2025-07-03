'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  QuestionMarkCircleIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

export default function ContactPage() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return;
    
    // TODO: Implement form submission logic
    console.log('Form submitted:', formData);
    alert('お問い合わせを送信しました。ありがとうございます！');
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
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='%23E8D5B7' opacity='0.3' viewBox='0 0 512 512'%3E%3Cpath d='M144 96c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm-32 224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm128-224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zM256 320c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm48-160c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zM368 96c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm-32 224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10 p-4">
        <h1 className="text-3xl font-bold mb-4 text-[#484848]">お問い合わせ</h1>
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white p-4 rounded-t-lg mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#FAF6F1] p-2 rounded-full mr-3 w-[60px] h-[60px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=45&h=45&fit=crop&crop=center" 
                className="rounded-full w-[45px] h-[45px] object-cover" 
                alt="犬旅びより"
              />
            </div>
            <h2 className="text-xl font-bold">Inutabi-biyori- 愛犬と泊まれる宿が見つかる、旅の検索サイト</h2>
          </div>
          <div className="text-lg font-medium">お問い合わせ</div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          {/* FAQ Section */}
          <div className="mb-6">
            <div className="bg-[#F5F0E8] text-[#555555] p-3 rounded-md mb-3 font-semibold flex items-center">
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              よくある質問
            </div>
            <div className="mb-4">
              <p className="mb-2">お問い合わせの前に、よくある質問をご確認ください。</p>
              <Link href="/search" className="flex items-center text-red-500 hover:text-red-600 font-medium">
                <HeartIcon className="w-4 h-4 mr-2" />
                よくある質問はこちら
              </Link>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="bg-[#F5F0E8] text-[#555555] p-3 rounded-md mb-4 font-semibold flex items-center">
            <EnvelopeIcon className="w-5 h-5 mr-2" />
            お問い合わせフォーム
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="font-medium mb-2">よくある質問で解決しない場合は、こちらからお問い合わせください。</p>
            <p className="font-medium mb-2">掲載希望の宿泊施設様や企業様は、下記よりお願いいたします。</p>
            
            {/* Business Contact Link - Enhanced Visibility */}
            <div className="bg-gradient-to-r from-[#FF5A5F]/10 to-[#FF385C]/10 border border-[#FF5A5F]/30 rounded-lg p-4 mb-4">
              <Link href="/business-contact" className="flex items-center text-[#FF5A5F] hover:text-[#FF385C] font-semibold text-lg transition-colors duration-300">
                <BuildingOfficeIcon className="w-6 h-6 mr-3" />
                <span>宿泊施設・企業様向けお問い合わせはこちら</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="text-sm text-gray-600 mt-2 ml-9">掲載・提携に関するご相談はこちらからお願いいたします</p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
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
                件名 <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="subject"
                value={formData.subject}
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
                    ? 'bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] hover:from-[#FF7A7F] hover:to-[#FF587C] hover:-translate-y-0.5 hover:shadow-lg' 
                    : 'bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] opacity-70 cursor-not-allowed'
                }`}
              >
                <HeartIcon className="w-4 h-4 mr-2" />
                送信する
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="bg-[#3A3A3A] text-white mt-16 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <HeartIcon className="w-6 h-6 mr-2 text-[#FF5A5F]" />
                  <h3 className="font-bold text-white">犬旅びより</h3>
                </div>
                <p className="text-sm text-gray-300 mb-4">
                  愛犬との素敵な旅行をサポートします
                </p>
                <div className="flex space-x-3">
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs text-white font-bold">F</span>
                  </a>
                  <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs text-white font-bold">T</span>
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FF5A5F] hover:-translate-y-1 transition-all duration-300">
                    <span className="text-xs text-white font-bold">I</span>
                  </a>
                </div>
              </div>

              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <HeartIcon className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  サービス
                </div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/search" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">宿を探す</Link></li>
                  <li><Link href="/favorites" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">お気に入り</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">予約履歴</Link></li>
                </ul>
              </div>
              
              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <BuildingOfficeIcon className="w-4 h-4 mr-2 text-[#FF5A5F]" />
                  宿泊施設向け
                </div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/business-contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">宿を掲載する</Link></li>
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">管理画面</Link></li>
                </ul>
              </div>
              
              <div>
                <div className="flex items-center font-bold mb-4 text-white">
                  <HeartIcon className="w-4 h-4 mr-2 text-[#FF5A5F]" />
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
              <p>&copy; 2024 犬旅びより. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 