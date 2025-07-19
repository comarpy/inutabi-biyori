import Link from 'next/link';
import { Dog } from 'lucide-react';
import { 
  BuildingStorefrontIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  NoSymbolIcon,
  LockClosedIcon,
  PowerIcon,
  UserGroupIcon,
  ShieldExclamationIcon,
  PencilIcon,
  ScaleIcon,
  HeartIcon,
  EnvelopeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { XIcon } from '../../components/XIcon';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#FAF6F1] relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='%23E8D5B7' opacity='0.3' viewBox='0 0 512 512'%3E%3Cpath d='M144 96c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm-32 224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm128-224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zM256 320c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zm48-160c-26.5 0 48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48zM368 96c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48zm-32 224c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#FF5A5F] to-[#FF385C] text-white p-3 rounded-t-lg flex items-center justify-between mb-1">
          <div className="flex items-center">
            <div className="bg-[#FAF6F1] p-3 rounded-full mr-3 w-[70px] h-[70px] flex items-center justify-center">
              <Dog className="w-8 h-8 text-[#FF5A5F]" />
            </div>
            <h2 className="text-2xl font-bold">犬旅びより</h2>
          </div>
          <div className="text-xl font-medium">利用規約</div>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-1 max-h-[480px] overflow-y-auto">
          <p className="text-center text-sm mb-3">
            この利用規約（以下「本規約」）は、犬旅びより（以下「当サイト」）の利用条件を定めるものです。
            会員登録をされる方、また当サイトをご利用になる方は、本規約に同意したものとみなします。
          </p>

          <div className="w-full mx-auto space-y-2.5">
            {/* 第1条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <BuildingStorefrontIcon className="w-4 h-4 mr-2" />
                第1条（サービス内容）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイト「犬旅びより」は、愛犬と泊まれる宿およびイベント情報の検索・閲覧サービスを提供します。</li>
                  <li>宿泊予約は、当サイトで紹介している宿の公式HPやアフィリエイト提携先の外部サイトで行われるものとします。</li>
                  <li>会員は、宿泊施設やイベントのお気に入り登録機能、メールマガジン配信サービスを利用することができます。</li>
                </ol>
              </div>
            </div>

            {/* 第2条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <SpeakerWaveIcon className="w-4 h-4 mr-2" />
                第2条（アフィリエイト・広告表示）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイトは、紹介する宿泊施設やイベント情報について、アフィリエイトリンクや広告を表示しています。</li>
                  <li>アフィリエイトリンクを経由して行われた宿泊予約やサービス申込みについては、当サイト運営者が提携先から報酬を得ます。</li>
                  <li>アフィリエイトリンク先のサービスについては、リンク先の提供者の規約に従うものとします。</li>
                </ol>
              </div>
            </div>

            {/* 第3条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                第3条（知的財産権）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイト内のテキスト、画像、デザイン等のコンテンツの著作権は、当サイト運営者または正当な権利者に帰属します。</li>
                  <li>会員が投稿したレビューや写真等のコンテンツの著作権は会員に帰属しますが、当サイトは無償で使用・編集・削除する権利を有します。</li>
                  <li>当サイトのコンテンツを、商用利用、二次配布、改変等の目的で無断使用することを禁じます。</li>
                  <li>「犬旅びより」の名称およびロゴは当サイト運営者が権利を有しており、無断使用を禁止します。</li>
                </ol>
              </div>
            </div>

            {/* 第4条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <NoSymbolIcon className="w-4 h-4 mr-2" />
                第4条（禁止事項）
              </div>
              <div className="text-xs pl-3">
                <p className="mb-1">当サイトに対する下記行為を禁止します。</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>不正アクセスやシステムに負荷をかける行為</li>
                  <li>他の会員や宿泊施設への迷惑行為、嫌がらせ</li>
                  <li>虚偽の情報登録、レビューの改ざん・偽装</li>
                  <li>当サイトのシステム情報を解析、改変する行為</li>
                  <li>スクレイピング等による大量データの収集・転用</li>
                </ol>
              </div>
            </div>

            {/* 第5条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <LockClosedIcon className="w-4 h-4 mr-2" />
                第5条（アカウント停止・削除）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイト運営者は、会員が本規約に違反した場合、事前通知なくアカウントの一時停止または削除ができます。</li>
                  <li>アカウント停止中は、お気に入り登録等の会員機能が利用できなくなります。</li>
                  <li>会員がアカウント削除を希望する場合は、所定の手続きで退会することができます。</li>
                </ol>
              </div>
            </div>

            {/* 第6条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <PowerIcon className="w-4 h-4 mr-2" />
                第6条（サービス変更・停止）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイト運営者は、サービスの内容を予告なく変更、追加、削除する権利を有します。</li>
                  <li>システムメンテナンス、障害発生時、その他やむを得ない事由により、サービスを一時的に中断する場合があります。</li>
                </ol>
              </div>
            </div>

            {/* 第7条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <UserGroupIcon className="w-4 h-4 mr-2" />
                第7条（第三者サービス連携）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイトは、宿泊予約サイト、地図サービス、SNS等の外部サービスと連携しています。</li>
                  <li>外部サービスのご利用にあたっては、各サービス提供者の利用規約が適用されます。</li>
                </ol>
              </div>
            </div>

            {/* 第8条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <ShieldExclamationIcon className="w-4 h-4 mr-2" />
                第8条（免責事項）
              </div>
              <div className="text-xs pl-3">
                <ol className="list-decimal pl-6 space-y-1">
                  <li>当サイトで提供される情報の正確性、完全性、有用性等について保証するものではありません。</li>
                  <li>当サイトからリンクする外部サイトでの取引や予約等に関するトラブルについて、当サイトは責任を負いません。</li>
                </ol>
              </div>
            </div>

            {/* 第9条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <PencilIcon className="w-4 h-4 mr-2" />
                第9条（規約の変更）
              </div>
              <div className="text-xs pl-3">
                <p className="mb-2">当サイト運営者は、必要と判断した場合には、本規約を変更することがあります。</p>
                <p>重要な変更の場合は、事前に当サイト上で告知します。変更後の利用規約は、当サイト上に表示した時点より効力を生じるものとします。</p>
              </div>
            </div>

            {/* 第10条 */}
            <div className="mb-2.5">
              <div className="bg-[#F5F0E8] text-[#555555] p-1.5 rounded-md mb-1 font-semibold text-sm flex items-center">
                <ScaleIcon className="w-4 h-4 mr-2" />
                第10条（準拠法・管轄裁判所）
              </div>
              <div className="text-xs pl-3">
                <p>本規約の解釈にあたっては日本法を準拠法とし、当サイトに関連して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
              </div>
            </div>

            <div className="text-right text-xs mt-4">
              <p>制定日：2025年7月1日</p>
              <p>最終更新日：2025年7月1日</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#3A3A3A] text-white mt-16 rounded-b-xl">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <HeartIcon className="w-6 h-6 mr-2 text-[#FF5A5F]" />
                  <h3 className="font-bold text-white">犬旅びより</h3>
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
                  {/* 機能未実装のため一時的に非表示 */}
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
              <p>© 2025 犬旅びより All Rights Reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 