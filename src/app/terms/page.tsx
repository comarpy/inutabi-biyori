import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '第1条(サービス内容)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイト「犬旅びより」は、愛犬と泊まれる宿およびイベント情報の検索・閲覧サービスを提供します。</li>
        <li>宿泊予約は、当サイトで紹介している宿の公式HPやアフィリエイト提携先の外部サイトで行われるものとします。</li>
        <li>会員は、宿泊施設やイベントのお気に入り登録機能、メールマガジン配信サービスを利用することができます。</li>
      </ol>
    ),
  },
  {
    title: '第2条(アフィリエイト・広告表示)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイトは、紹介する宿泊施設やイベント情報について、アフィリエイトリンクや広告を表示しています。</li>
        <li>アフィリエイトリンクを経由して行われた宿泊予約やサービス申込みについては、当サイト運営者が提携先から報酬を得ます。</li>
        <li>アフィリエイトリンク先のサービスについては、リンク先の提供者の規約に従うものとします。</li>
      </ol>
    ),
  },
  {
    title: '第3条(知的財産権)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイト内のテキスト、画像、デザイン等のコンテンツの著作権は、当サイト運営者または正当な権利者に帰属します。</li>
        <li>会員が投稿したレビューや写真等のコンテンツの著作権は会員に帰属しますが、当サイトは無償で使用・編集・削除する権利を有します。</li>
        <li>当サイトのコンテンツを、商用利用、二次配布、改変等の目的で無断使用することを禁じます。</li>
        <li>「犬旅びより」の名称およびロゴは当サイト運営者が権利を有しており、無断使用を禁止します。</li>
      </ol>
    ),
  },
  {
    title: '第4条(禁止事項)',
    body: (
      <>
        <p className="mb-1.5">当サイトに対する下記行為を禁止します。</p>
        <ol className="list-decimal pl-5 space-y-1">
          <li>不正アクセスやシステムに負荷をかける行為</li>
          <li>他の会員や宿泊施設への迷惑行為、嫌がらせ</li>
          <li>虚偽の情報登録、レビューの改ざん・偽装</li>
          <li>当サイトのシステム情報を解析、改変する行為</li>
          <li>スクレイピング等による大量データの収集・転用</li>
        </ol>
      </>
    ),
  },
  {
    title: '第5条(アカウント停止・削除)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイト運営者は、会員が本規約に違反した場合、事前通知なくアカウントの一時停止または削除ができます。</li>
        <li>アカウント停止中は、お気に入り登録等の会員機能が利用できなくなります。</li>
        <li>会員がアカウント削除を希望する場合は、所定の手続きで退会することができます。</li>
      </ol>
    ),
  },
  {
    title: '第6条(サービス変更・停止)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイト運営者は、サービスの内容を予告なく変更、追加、削除する権利を有します。</li>
        <li>システムメンテナンス、障害発生時、その他やむを得ない事由により、サービスを一時的に中断する場合があります。</li>
      </ol>
    ),
  },
  {
    title: '第7条(第三者サービス連携)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイトは、宿泊予約サイト、地図サービス、SNS等の外部サービスと連携しています。</li>
        <li>外部サービスのご利用にあたっては、各サービス提供者の利用規約が適用されます。</li>
      </ol>
    ),
  },
  {
    title: '第8条(免責事項)',
    body: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>当サイトで提供される情報の正確性、完全性、有用性等について保証するものではありません。</li>
        <li>当サイトからリンクする外部サイトでの取引や予約等に関するトラブルについて、当サイトは責任を負いません。</li>
      </ol>
    ),
  },
  {
    title: '第9条(規約の変更)',
    body: (
      <>
        <p className="mb-2">当サイト運営者は、必要と判断した場合には、本規約を変更することがあります。</p>
        <p>重要な変更の場合は、事前に当サイト上で告知します。変更後の利用規約は、当サイト上に表示した時点より効力を生じるものとします。</p>
      </>
    ),
  },
  {
    title: '第10条(準拠法・管轄裁判所)',
    body: (
      <p>本規約の解釈にあたっては日本法を準拠法とし、当サイトに関連して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
    ),
  },
];

export default function TermsOfServicePage() {
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
          利用規約
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          この利用規約(以下「本規約」)は、犬旅びより(以下「当サイト」)の利用条件を定めるものです。
          会員登録をされる方、また当サイトをご利用になる方は、本規約に同意したものとみなします。
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
