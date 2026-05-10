'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Building2, Send } from 'lucide-react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

export default function BusinessContactPage() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAgreed || isSubmitting) return;

    setIsSubmitting(true);
    const form = e.currentTarget;
    const hpInput = form.querySelector('input[name="hp_field"]') as HTMLInputElement | null;
    const hp_field = hpInput?.value || '';

    try {
      const response = await fetch('/api/business-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, hp_field }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('お問い合わせを送信しました。3営業日以内にご連絡いたします。');
        setFormData({ companyName: '', email: '', phone: '', message: '' });
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
            fontSize: 'clamp(22px, 3.8vw, 30px)',
            color: 'var(--text)',
          }}
        >
          宿泊施設・企業様向けお問い合わせ
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          掲載・提携に関するご相談はこちらからお願いいたします。
        </p>

        <div
          className="p-5 md:p-7"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--sh-sm)',
          }}
        >
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
            <Building2 className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            掲載・提携のお問い合わせ
          </div>

          <p className="text-[14px] mb-2" style={{ color: 'var(--text)' }}>
            「犬旅びより」への掲載をご希望の宿泊施設様、提携をご検討の企業様は、以下のフォームよりお問い合わせください。
          </p>
          <p className="text-[14px] mb-4" style={{ color: 'var(--text-muted)' }}>
            担当者より3営業日以内にご連絡いたします。
          </p>

          <div
            className="mb-6 p-3"
            style={{
              background: 'var(--accent-soft)',
              borderRadius: 'var(--r-sm)',
            }}
          >
            <p className="text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
              一般的なお問い合わせの場合は：
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              <Mail className="w-3.5 h-3.5" />
              一般お問い合わせフォームはこちら →
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <label>
                HP (do not fill)
                <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <FormField label="宿泊施設名/企業名" required>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
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
            <FormField label="電話番号" required>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
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
                {isSubmitting ? '送信中...' : (
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
