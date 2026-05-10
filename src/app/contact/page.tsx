'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, HelpCircle, Building2, Send } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

export default function ContactPage() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAgreed || isSubmitting) return;

    setIsSubmitting(true);
    const form = e.currentTarget;
    const honeypotInput = form.querySelector('input[name="website"]') as HTMLInputElement | null;
    const website = honeypotInput?.value || '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, website }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('お問い合わせを送信しました。ありがとうございます！');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsAgreed(false);
      } else {
        alert(`送信に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信中にエラーが発生しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
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
          お問い合わせ
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          ご質問・ご意見・ご要望など、お気軽にお問い合わせください。
        </p>

        <div
          className="p-5 md:p-7 mb-5"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <SectionLabel icon={HelpCircle}>よくある質問</SectionLabel>
          <p className="text-[13px] mb-2" style={{ color: 'var(--text-muted)' }}>
            お問い合わせの前に、よくある質問をご確認ください。
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: 'var(--primary)' }}
          >
            よくある質問はこちら →
          </Link>

          <div
            className="mt-5 p-4"
            style={{
              background: 'var(--primary-soft)',
              border: '1px solid transparent',
              borderRadius: 'var(--r-sm)',
            }}
          >
            <Link
              href="/business-contact"
              className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--primary)' }}
            >
              <Building2 className="w-5 h-5" />
              <span>宿泊施設・企業様向けお問い合わせはこちら →</span>
            </Link>
            <p className="text-[12px] mt-2 ml-7" style={{ color: 'var(--text-muted)' }}>
              掲載・提携に関するご相談はこちらからお願いいたします
            </p>
          </div>
        </div>

        <div
          className="p-5 md:p-7"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <SectionLabel icon={Mail}>お問い合わせフォーム</SectionLabel>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <label>
                Website (do not fill)
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <FormField label="お名前" required>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full"
                style={inputStyle}
                required
              />
            </FormField>
            <FormField label="メールアドレス" required>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full"
                style={inputStyle}
                required
              />
            </FormField>
            <FormField label="件名" required>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full"
                style={inputStyle}
                required
              />
            </FormField>
            <FormField label="お問い合わせ内容" required>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className="w-full"
                style={{ ...inputStyle, padding: '10px 12px' }}
                required
              />
            </FormField>

            <label className="flex items-start gap-2 cursor-pointer mt-4">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 mt-1 flex-shrink-0"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                required
              />
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                <Link href="/terms" style={{ color: 'var(--primary)' }} className="hover:underline">
                  利用規約
                </Link>
                および
                <Link href="/privacy" style={{ color: 'var(--primary)' }} className="hover:underline">
                  プライバシーポリシー
                </Link>
                に同意します
                <span style={{ color: 'var(--primary)' }}>*</span>
              </span>
            </label>

            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={!isAgreed || isSubmitting}
                className="kt-btn kt-btn--primary"
                style={{ padding: '12px 28px', fontSize: 14 }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-4 w-4 mr-1"
                      style={{
                        borderBottom: '2px solid #fff',
                        borderLeft: '2px solid transparent',
                        borderRight: '2px solid transparent',
                        borderTop: '2px solid transparent',
                      }}
                    />
                    送信中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    送信する
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--line)',
  borderRadius: 'var(--r-sm)',
  padding: '10px 12px',
  fontSize: 14,
  color: 'var(--text)',
};

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 mb-4"
      style={{
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-sm)',
        color: 'var(--text)',
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      <Icon className="w-4 h-4" style={{ color: 'var(--primary)' }} />
      {children}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
        {label}
        {required && <span style={{ color: 'var(--primary)' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
