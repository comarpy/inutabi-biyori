import Link from 'next/link';
import { Instagram, Facebook } from 'lucide-react';
import { XIcon } from '@/components/XIcon';

export default function SiteFooter() {
  return (
    <footer
      style={{
        background: 'var(--surface-2)',
        borderTop: '1px solid var(--line)',
        color: 'var(--text-soft)',
      }}
      className="mt-16"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div
              className="font-bold mb-3 text-sm"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}
            >
              犬旅びより
            </div>
            <p className="text-xs leading-relaxed">
              愛犬と泊まれる宿が見つかる、旅の検索サイト
            </p>
          </div>

          <div>
            <div className="font-bold mb-3 text-sm" style={{ color: 'var(--text)' }}>
              サポート
            </div>
            <ul className="space-y-2 text-xs">
              <li><Link href="/faq" className="hover:opacity-70 transition-opacity">よくある質問</Link></li>
              <li><Link href="/contact" className="hover:opacity-70 transition-opacity">お問い合わせ</Link></li>
              <li><Link href="/terms" className="hover:opacity-70 transition-opacity">利用規約</Link></li>
              <li><Link href="/privacy" className="hover:opacity-70 transition-opacity">プライバシーポリシー</Link></li>
              <li><Link href="/business-contact" className="hover:opacity-70 transition-opacity">宿を掲載する</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-bold mb-3 text-sm" style={{ color: 'var(--text)' }}>
              SNS
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61578037163409&locale=ja_JP"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <Facebook className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </a>
              <a
                href="https://x.com/inutabi_biyori"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <XIcon size={16} className="text-[color:var(--text-muted)]" />
              </a>
              <a
                href="https://www.instagram.com/inutabi_biyori?igsh=dzlkOGRpMHJtamVq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
              >
                <Instagram className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </a>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-6 text-center text-[11px]"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          © 2026 犬旅びより All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
