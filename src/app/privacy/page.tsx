import Link from 'next/link';
import { 
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  ShareIcon,
  GlobeAsiaAustraliaIcon,
  LockClosedIcon,
  ClockIcon,
  UserIcon,
  PencilIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-2xl font-bold mb-2 text-[#484848]">犬旅びより - プライバシーポリシー</h1>
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white p-3 rounded-t-lg mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-[#FAF6F1] p-2.5 rounded-full mr-3 w-[70px] h-[70px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=50&h=50&fit=crop&crop=center" 
                className="rounded-full w-[50px] h-[50px] object-cover" 
                alt="犬旅びより"
              />
            </div>
            <h2 className="text-xl font-bold">犬旅びより- 愛犬と泊まれる宿が見つかる、旅の検索サイト</h2>
          </div>
          <div className="text-base font-medium">プライバシーポリシー</div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-3 max-h-[540px] overflow-y-auto">
          <p className="text-sm mb-2">
            「犬旅びより」（以下「当サイト」）は、宿泊予約サイトや関連サービスとアフィリエイトプログラムを提携しています。
          </p>
          <p className="text-sm mb-4">
            当サイトで取り扱うお客様の個人情報について、以下のとおりプライバシーポリシーを定めます。
          </p>

          <div className="space-y-3">
            {/* 第1条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2" />
                第1条（個人情報の取得）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">当サイトは、以下の場合に個人情報を取得します：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>会員登録時（氏名、メールアドレス、居住地、愛犬情報など）</li>
                  <li>お問い合わせ、キャンペーン応募時</li>
                </ul>
              </div>
            </div>

            {/* 第2条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                第2条（利用目的）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">取得した個人情報は、以下の目的で利用します：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>会員登録・本人確認・認証</li>
                  <li>お気に入り機能、メールマガジン配信</li>
                  <li>サービス改善のためのデータ分析</li>
                  <li>お問い合わせへの回答</li>
                </ul>
              </div>
            </div>

            {/* 第3条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <ShareIcon className="w-4 h-4 mr-2" />
                第3条（第三者提供）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">以下の場合を除き、個人情報を第三者に提供しません：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>お客様の同意がある場合</li>
                  <li>法令に基づく場合</li>
                  <li>人の生命、身体、財産保護のために必要な場合</li>
                </ul>
              </div>
            </div>

            {/* 第4条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <GlobeAsiaAustraliaIcon className="w-4 h-4 mr-2" />
                第4条（Cookieと解析ツール）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">当サイトではCookieを使用し、Google Analyticsによるアクセス解析を行っています。</p>
                <p className="mb-1">収集するデータ：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>閲覧ページ、滞在時間、地域、デバイス情報</li>
                  <li>クッキーの使用を望まない場合はブラウザで無効化できます</li>
                </ul>
              </div>
            </div>

            {/* 第5条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <ShareIcon className="w-4 h-4 mr-2" />
                第5条（アフィリエイト）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">当サイトは各種宿泊予約サイトとアフィリエイト提携しています：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>アフィリエイトリンク経由での遷移により報酬を得ています</li>
                  <li>宿予約は各提携サイトのプライバシーポリシーが適用されます</li>
                </ul>
              </div>
            </div>

            {/* 第6条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <LockClosedIcon className="w-4 h-4 mr-2" />
                第6条（安全管理）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">個人情報保護のセキュリティ対策：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>SSL暗号化通信の採用</li>
                  <li>アクセス権限の管理</li>
                  <li>定期的なセキュリティチェック</li>
                </ul>
              </div>
            </div>

            {/* 第7条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" />
                第7条（保存期間）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">個人情報の保存期間について：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>会員情報は退会までまたは最終ログインから2年間保存</li>
                  <li>お問い合わせ情報は対応完了後1年間保存</li>
                  <li>退会後のデータは速やかに削除します</li>
                </ul>
              </div>
            </div>

            {/* 第8条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <UserIcon className="w-4 h-4 mr-2" />
                第8条（個人情報の開示・訂正・削除）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">個人情報保護法に基づく権利行使はお問い合わせフォームよりご連絡ください：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>個人情報の開示、訂正、追加、削除の請求</li>
                  <li>利用停止、第三者提供停止の請求</li>
                </ul>
              </div>
            </div>

            {/* 第9条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <GlobeAsiaAustraliaIcon className="w-4 h-4 mr-2" />
                第9条（海外への情報移転）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-1">Googleアナリティクス等の利用により、情報が海外に移転する場合があります：</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>情報がGoogleのサーバーに送信されます</li>
                  <li>Google社のプライバシーポリシーが適用されます</li>
                </ul>
              </div>
            </div>

            {/* 第10条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <PencilIcon className="w-4 h-4 mr-2" />
                第10条（プライバシーポリシーの変更）
              </div>
              <div className="px-2 text-xs">
                <p>当サイトは、必要に応じて本ポリシーを変更することがあります。変更時は当サイト上で告知し、表示時点より効力が発生します。</p>
              </div>
            </div>

            {/* 第11条 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <QuestionMarkCircleIcon className="w-4 h-4 mr-2" />
                第11条（お問い合わせ）
              </div>
              <div className="px-2 text-xs">
                <p className="mb-2">個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
                <Link 
                  href="/contact" 
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md inline-flex items-center transition-colors text-xs"
                >
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  お問い合わせフォーム
                </Link>
              </div>
            </div>

            {/* 運営者情報 */}
            <div className="mb-3">
              <div className="bg-[#F5F0E8] text-[#555555] p-2 rounded-md mb-2 font-semibold text-sm flex items-center">
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                運営者情報
              </div>
              <div className="px-2 text-xs">
                <ul className="list-disc pl-4 space-y-1">
                  <li><span className="font-semibold">事業者名：</span>株式会社コマーピー</li>
                  <li><span className="font-semibold">代表者：</span>元廣 祐太</li>
                  <li><span className="font-semibold">所在地：</span>東京都中央区</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-right mt-4 text-xs">
            <p>制定日：2025年7月1日</p>
            <p>最終更新日：2025年7月1日</p>
          </div>
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
                  <li><Link href="/contact" className="text-gray-300 hover:text-white hover:underline cursor-pointer transition-colors">宿を掲載する</Link></li>
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