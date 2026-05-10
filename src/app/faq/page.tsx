'use client';

import { useState, FC, ReactNode } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Building2, LifeBuoy, Mail, Info } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

interface FaqItemProps {
  id: string;
  question: string;
  children: ReactNode;
  openFaqs: { [key: string]: boolean };
  toggleFaq: (id: string) => void;
}

const FaqItem: FC<FaqItemProps> = ({ id, question, children, openFaqs, toggleFaq }) => {
  const isOpen = openFaqs[id];
  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)' }} className="py-3">
      <button
        type="button"
        className="w-full flex justify-between items-start gap-3 text-left"
        onClick={() => toggleFaq(id)}
      >
        <span className="flex items-start gap-2 flex-1">
          <HelpCircle
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            style={{ color: 'var(--primary)' }}
          />
          <span className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>
            {question}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: 'var(--text-soft)' }}
        />
      </button>
      {isOpen && (
        <p
          className="ml-6 mt-2 text-[13px]"
          style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}
        >
          {children}
        </p>
      )}
    </div>
  );
};

export default function FAQPage() {
  const [openFaqs, setOpenFaqs] = useState<{ [key: string]: boolean }>({});

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const faqData = {
    usage: [
      { id: 'u1', q: '犬旅びよりとはどんなサイトですか？', a: '愛犬と一緒に泊まれる宿・ホテルを全国から検索できるサイトです。microCMSで管理している独自の厳選宿データと、楽天トラベルの情報を組み合わせて、ドッグラン付き・温泉付き・大型犬OKなどこだわり条件で絞り込めます。' },
      { id: 'u2', q: '検索結果が表示されません', a: 'まずエリア(都道府県)を1つ以上選択してください。詳細条件を多く指定し過ぎると該当する宿がない場合があります。条件を減らしてお試しください。' },
      { id: 'u3', q: '大型犬OKの宿を探したい', a: 'トップページまたは検索ページの「詳細条件」から「大型犬OK」にチェックを入れて検索してください。中型犬・小型犬も同様に絞り込めます。' },
      { id: 'u4', q: 'ドッグラン付きの宿はどう探す？', a: '詳細条件で「ドッグラン」または「客室ドッグラン」にチェックを入れてください。宿によっては有料の場合があります。' },
    ],
    pet: [
      { id: 'p1', q: '犬と泊まれる宿の予約で、事前に用意するものは？', a: 'ほとんどの宿でワクチン接種証明書(狂犬病・混合ワクチン)の提示が求められます。また、リード、ケージ、食器、ペットシーツ、マナーパンツなどを持参するのが一般的です。宿ごとに貸出アメニティが異なるので、詳細ページでご確認ください。' },
      { id: 'p2', q: '犬のサイズや頭数制限は？', a: '宿によって「小型犬のみ」「大型犬OK」「1室最大2頭」など異なります。詳細ページの「ペット宿泊情報」で必ずご確認ください。' },
      { id: 'p3', q: 'ペット追加料金はかかりますか？', a: '多くの宿で1頭あたり1泊 ¥1,000〜¥5,000 程度のペット料金が発生します。詳細ページに料金情報が記載されています。' },
      { id: 'p4', q: 'ペット同伴で食事できる宿を探したい', a: '詳細条件で「犬用メニュー」や「ペット同伴食事」にチェックを入れてください。一緒にダイニングで食事できる宿が絞り込めます。' },
    ],
    booking: [
      { id: 'b1', q: '掲載内容とリンク先サイトの情報に違いがある', a: '掲載内容については最新状態を心がけていますが、宿側での条件変更などが発生する可能性がございます。宿公式HPやリンク先予約サイトの情報をご確認の上、ご予約ください。また、情報の違いを発見された場合は、お問い合わせフォームよりご一報いただけますと幸いです。' },
      { id: 'b2', q: '気に入った宿の予約をしたい', a: '本ウェブサイトは愛犬と一緒に泊まれる宿の情報を提供するサイトです。詳細ページから楽天トラベルなどの予約サイトへ移動してご予約ください。ご予約に関するトラブル等について、弊サイトは責任を負いませんのでご注意ください。' },
      { id: 'b3', q: '予約した内容を変更・キャンセルしたい', a: 'ご予約された各サイトよりご自身でご対応をお願いいたします。弊サイトはお客様と予約サイト・公式HP間のご予約について一切関知しておりません。' },
    ],
    owner: [
      { id: 'o1', q: '宿を掲載したい', a: 'ご掲載希望の場合は、宿泊施設向けページからお問い合わせください。内容確認の上、担当者よりご連絡させていただきます。' },
      { id: 'o2', q: '掲載内容を修正・削除したい', a: '宿泊施設向けページからご要望をお知らせください。内容確認の上、ご対応いたします。' },
      { id: 'o3', q: '掲載内容を充実させ、PRをより強く行いたい', a: '宿泊施設向けページからご連絡をお願いいたします。PR可能な内容やプランについて、担当者よりご提案いたします。' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...faqData.usage, ...faqData.pet, ...faqData.booking, ...faqData.owner].map(
      (f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })
    ),
  };

  const groups: { title: string; icon: typeof HelpCircle; items: { id: string; q: string; a: string }[] }[] = [
    { title: '使い方・検索について', icon: HelpCircle, items: faqData.usage },
    { title: '犬との宿泊について', icon: Info, items: faqData.pet },
    { title: '掲載情報・ご予約について', icon: Info, items: faqData.booking },
    { title: '宿の運営会社様へ', icon: Building2, items: faqData.owner },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <SiteHeader />

        <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              color: 'var(--text)',
            }}
          >
            よくある質問
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            「犬旅びより」をご利用いただく際によくいただくご質問と回答をまとめました。
            お探しの情報が見つからない場合は、お問い合わせページからお気軽にご連絡ください。
          </p>

          {groups.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.title}
                className="p-5 mb-4"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: 'var(--sh-sm)',
                }}
              >
                <h2
                  className="font-bold mb-2 flex items-center gap-2"
                  style={{
                    fontSize: 16,
                    color: 'var(--text)',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  {group.title}
                </h2>
                <div>
                  {group.items.map((faq) => (
                    <FaqItem
                      key={faq.id}
                      id={faq.id}
                      question={faq.q}
                      openFaqs={openFaqs}
                      toggleFaq={toggleFaq}
                    >
                      A. {faq.a}
                    </FaqItem>
                  ))}
                </div>
              </div>
            );
          })}

          <div
            className="p-5 mt-6 flex items-start gap-3"
            style={{
              background: 'var(--surface-2)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <LifeBuoy className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <div className="flex-1">
              <p className="font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
                よくある質問で解決しない場合
              </p>
              <p className="text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>
                お問い合わせフォームからお気軽にご連絡ください。
              </p>
              <Link
                href="/contact"
                className="kt-btn kt-btn--primary inline-flex"
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                <Mail className="w-3.5 h-3.5" />
                お問い合わせはこちら
              </Link>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
