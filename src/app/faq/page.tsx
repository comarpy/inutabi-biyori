'use client';

import { useState, FC, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Info, 
  HelpCircle, 
  ChevronDown, 
  Building, 
  LifeBuoy, 
  Mail,
  Instagram,
  Facebook,
  MessageCircle
} from 'lucide-react';
import { XIcon } from '@/components/XIcon';

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
    <div className="border-b border-gray-200 py-4">
      <div className="cursor-pointer font-semibold flex justify-between items-center" onClick={() => toggleFaq(id)}>
        <span className="flex items-center">
          <HelpCircle className="inline-block text-[#FF5A5F] mr-2 w-5 h-5 flex-shrink-0" />
          {question}
        </span>
        <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="pt-2">
          <p className="ml-7 text-gray-600">{children}</p>
        </div>
      )}
    </div>
  );
};

export default function FAQPage() {
  const [openFaqs, setOpenFaqs] = useState<{ [key: string]: boolean }>({});

  const toggleFaq = (id: string) => {
    setOpenFaqs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const faqData = {
    usage: [
      { id: 'u1', q: '犬旅びよりとはどんなサイトですか？', a: '愛犬と一緒に泊まれる宿・ホテルを全国から検索できるサイトです。microCMSで管理している独自の厳選宿データと、楽天トラベルの情報を組み合わせて、ドッグラン付き・温泉付き・大型犬OKなどこだわり条件で絞り込めます。' },
      { id: 'u2', q: '検索結果が表示されません', a: 'まずエリア（都道府県）を1つ以上選択してください。詳細条件を多く指定し過ぎると該当する宿がない場合があります。条件を減らしてお試しください。' },
      { id: 'u3', q: '大型犬OKの宿を探したい', a: 'トップページまたは検索ページの「詳細条件」から「大型犬OK」にチェックを入れて検索してください。中型犬・小型犬も同様に絞り込めます。' },
      { id: 'u4', q: 'ドッグラン付きの宿はどう探す？', a: '詳細条件で「ドッグラン」または「客室ドッグラン」にチェックを入れてください。宿によっては有料の場合があります。' },
    ],
    pet: [
      { id: 'p1', q: '犬と泊まれる宿の予約で、事前に用意するものは？', a: 'ほとんどの宿でワクチン接種証明書（狂犬病・混合ワクチン）の提示が求められます。また、リード、ケージ、食器、ペットシーツ、マナーパンツなどを持参するのが一般的です。宿ごとに貸出アメニティが異なるので、詳細ページでご確認ください。' },
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

  // FAQ schema for SEO
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <style>{`
        body {
            background-color: #FAF6F1 !important;
        }
      `}</style>
      <div className="bg-[#FAF6F1] text-[#484848] py-10 px-4 font-sans">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <header className="bg-[#FF5A5F] text-white p-4 rounded-t-lg mb-4 flex items-center justify-between shadow-md">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="bg-[#FAF6F1] p-2 rounded-full mr-3">
                  <Image src="/icon.png" alt="犬旅びより" width={45} height={45} className="rounded-full" />
                </div>
                <h1 className="text-xl font-bold hidden sm:block">犬旅びより</h1>
              </Link>
            </div>
            <h2 className="text-lg font-medium">よくある質問</h2>
          </header>

          {/* コンテンツ */}
          <main className="bg-white rounded-b-lg shadow-lg p-6 mb-8">
            <p className="text-base sm:text-lg mb-6 leading-relaxed">「犬旅びより」をご利用いただく際によくいただくご質問と回答をまとめました。お探しの情報が見つからない場合は、お問い合わせページからお気軽にご連絡ください。</p>

            {/* 使い方・検索について */}
            <div className="bg-[#F5F0E8] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center text-gray-800">
                <HelpCircle className="mr-2 w-6 h-6" />使い方・検索について
              </h3>
              <div>
                {faqData.usage.map(faq => (
                  <FaqItem key={faq.id} id={faq.id} question={faq.q} openFaqs={openFaqs} toggleFaq={toggleFaq}>
                    A. {faq.a}
                  </FaqItem>
                ))}
              </div>
            </div>

            {/* 犬との宿泊について */}
            <div className="bg-[#F5F0E8] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center text-gray-800">
                <Info className="mr-2 w-6 h-6" />犬との宿泊について
              </h3>
              <div>
                {faqData.pet.map(faq => (
                  <FaqItem key={faq.id} id={faq.id} question={faq.q} openFaqs={openFaqs} toggleFaq={toggleFaq}>
                    A. {faq.a}
                  </FaqItem>
                ))}
              </div>
            </div>

            {/* 掲載情報・ご予約について */}
            <div className="bg-[#F5F0E8] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center text-gray-800">
                <Info className="mr-2 w-6 h-6" />掲載情報・ご予約について
              </h3>
              <div>
                {faqData.booking.map(faq => (
                  <FaqItem key={faq.id} id={faq.id} question={faq.q} openFaqs={openFaqs} toggleFaq={toggleFaq}>
                    A. {faq.a}
                  </FaqItem>
                ))}
              </div>
            </div>

            {/* 宿の運営会社様へ */}
            <div className="bg-[#F5F0E8] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center text-gray-800">
                <Building className="mr-2 w-6 h-6" />宿の運営会社様へ
              </h3>
              <div>
                {faqData.owner.map(faq => (
                  <FaqItem key={faq.id} id={faq.id} question={faq.q} openFaqs={openFaqs} toggleFaq={toggleFaq}>
                    A. {faq.a}
                  </FaqItem>
                ))}
              </div>
            </div>

            {/* 解決しない場合 */}
            <div className="bg-[#F5F0E8] rounded-lg p-5 mb-6">
              <h3 className="text-lg font-bold mb-2 flex items-center text-gray-800">
                <LifeBuoy className="mr-2 w-6 h-6" />よくある質問で解決しない場合
              </h3>
              <div className="border-b border-gray-200 py-4">
                <p className="ml-8">「お問い合わせ」よりフォームにてご連絡ください。</p>
              </div>
            </div>
          </main>

          {/* お問い合わせへの誘導 */}
          <div className="text-center mb-10">
            <p className="mb-4">お探しの質問が見つからない場合は、お問い合わせフォームからお気軽にご連絡ください。</p>
            <Link href="/contact" className="bg-[#FF5A5F] text-white font-semibold py-3 px-6 rounded-full inline-flex items-center transition-transform hover:-translate-y-1 hover:shadow-xl shadow-lg">
              <Mail className="mr-2 w-5 h-5" />お問い合わせはこちら
            </Link>
          </div>
          
          {/* フッター */}
          <footer className="bg-gray-800 text-white p-8 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {/* サービス */}
              <div>
                <h3 className="text-lg font-semibold mb-4">宿泊施設向け</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/business-contact" className="hover:text-gray-300">事業者様はこちら</Link></li>
                </ul>
              </div>
              
              {/* サポート */}
              <div>
                <h3 className="text-lg font-semibold mb-4">サポート</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/faq" className="hover:text-gray-300">よくある質問</Link></li>
                  <li><Link href="/contact" className="hover:text-gray-300">お問い合わせ</Link></li>
                  <li><Link href="/terms" className="hover:text-gray-300">利用規約</Link></li>
                  <li><Link href="/privacy" className="hover:text-gray-300">プライバシーポリシー</Link></li>
                </ul>
              </div>
              
              {/* SNS */}
              <div>
                <h3 className="text-lg font-semibold mb-4">SNS</h3>
                <div className="flex space-x-4">
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Instagram size={24} /></a>
                  <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><Facebook size={24} /></a>
                  <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><XIcon className="w-6 h-6" /></a>
                  <a href="https://line.me" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white"><MessageCircle size={24} /></a>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center text-gray-400">
              © 2024 犬旅びより All Rights Reserved.
            </div>
          </footer>
        </div>
      </div>
    </>
  );
} 