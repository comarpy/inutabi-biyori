import Link from 'next/link';
import { Mail } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '第1条（個人情報の取得）',
    body: (
      <>
        <p className="mb-1.5">当サイトは、以下の場合に個人情報を取得します：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>会員登録時(氏名、メールアドレス、居住地、愛犬情報など)</li>
          <li>お問い合わせ、キャンペーン応募時</li>
        </ul>
      </>
    ),
  },
  {
    title: '第2条(利用目的)',
    body: (
      <>
        <p className="mb-1.5">取得した個人情報は、以下の目的で利用します：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>会員登録・本人確認・認証</li>
          <li>お気に入り機能、メールマガジン配信</li>
          <li>サービス改善のためのデータ分析</li>
          <li>お問い合わせへの回答</li>
        </ul>
      </>
    ),
  },
  {
    title: '第3条(第三者提供)',
    body: (
      <>
        <p className="mb-1.5">以下の場合を除き、個人情報を第三者に提供しません：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>お客様の同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>人の生命、身体、財産保護のために必要な場合</li>
        </ul>
      </>
    ),
  },
  {
    title: '第4条(Cookieと解析ツール)',
    body: (
      <>
        <p className="mb-1.5">当サイトではCookieを使用し、Google Analyticsによるアクセス解析を行っています。</p>
        <p className="mb-1.5">収集するデータ：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>閲覧ページ、滞在時間、地域、デバイス情報</li>
          <li>クッキーの使用を望まない場合はブラウザで無効化できます</li>
        </ul>
      </>
    ),
  },
  {
    title: '第5条(アフィリエイト)',
    body: (
      <>
        <p className="mb-1.5">当サイトは各種宿泊予約サイトとアフィリエイト提携しています：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>アフィリエイトリンク経由での遷移により報酬を得ています</li>
          <li>宿予約は各提携サイトのプライバシーポリシーが適用されます</li>
        </ul>
      </>
    ),
  },
  {
    title: '第6条(安全管理)',
    body: (
      <>
        <p className="mb-1.5">個人情報保護のセキュリティ対策：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>SSL暗号化通信の採用</li>
          <li>アクセス権限の管理</li>
          <li>定期的なセキュリティチェック</li>
        </ul>
      </>
    ),
  },
  {
    title: '第7条(保存期間)',
    body: (
      <>
        <p className="mb-1.5">個人情報の保存期間について：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>会員情報は退会までまたは最終ログインから2年間保存</li>
          <li>お問い合わせ情報は対応完了後1年間保存</li>
          <li>退会後のデータは速やかに削除します</li>
        </ul>
      </>
    ),
  },
  {
    title: '第8条(個人情報の開示・訂正・削除)',
    body: (
      <>
        <p className="mb-1.5">個人情報保護法に基づく権利行使はお問い合わせフォームよりご連絡ください：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>個人情報の開示、訂正、追加、削除の請求</li>
          <li>利用停止、第三者提供停止の請求</li>
        </ul>
      </>
    ),
  },
  {
    title: '第9条(海外への情報移転)',
    body: (
      <>
        <p className="mb-1.5">Googleアナリティクス等の利用により、情報が海外に移転する場合があります：</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>情報がGoogleのサーバーに送信されます</li>
          <li>Google社のプライバシーポリシーが適用されます</li>
        </ul>
      </>
    ),
  },
  {
    title: '第10条(プライバシーポリシーの変更)',
    body: <p>当サイトは、必要に応じて本ポリシーを変更することがあります。変更時は当サイト上で告知し、表示時点より効力が発生します。</p>,
  },
  {
    title: '第11条(お問い合わせ)',
    body: (
      <>
        <p className="mb-2">個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。</p>
        <Link
          href="/contact"
          className="kt-btn kt-btn--primary inline-flex"
          style={{ padding: '8px 14px', fontSize: 12 }}
        >
          <Mail className="w-3.5 h-3.5" />
          お問い合わせフォーム
        </Link>
      </>
    ),
  },
  {
    title: '運営者情報',
    body: (
      <ul className="list-disc pl-5 space-y-1">
        <li><span className="font-semibold">事業者名：</span>株式会社コマーピー</li>
        <li><span className="font-semibold">代表者：</span>元廣 祐太</li>
        <li><span className="font-semibold">所在地：</span>東京都中央区銀座1丁目12番4号N&amp;EBLD.6F</li>
      </ul>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1
          className="font-bold mb-2"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3.8vw, 30px)',
            color: 'var(--text)',
          }}
        >
          プライバシーポリシー
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          「犬旅びより」(以下「当サイト」)は、宿泊予約サイトや関連サービスとアフィリエイトプログラムを提携しています。
          当サイトで取り扱うお客様の個人情報について、以下のとおりプライバシーポリシーを定めます。
        </p>

        <div
          className="p-5 md:p-7 space-y-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-sm)',
            color: 'var(--text-muted)',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2
                className="text-[14px] font-bold px-3 py-2 mb-3"
                style={{
                  background: 'var(--surface-2)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text)',
                }}
              >
                {s.title}
              </h2>
              <div className="px-1">{s.body}</div>
            </section>
          ))}

          <div
            className="text-right pt-4 text-[12px]"
            style={{ color: 'var(--text-soft)', borderTop: '1px solid var(--line-soft)' }}
          >
            <p>制定日：2025年7月1日</p>
            <p>最終更新日：2025年7月1日</p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
