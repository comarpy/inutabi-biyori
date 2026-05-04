import Link from 'next/link';
import { PawPrint } from 'lucide-react';

export default function SiteHeader() {
  return (
    <header
      style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
      }}
      className="px-4 md:px-8 py-3 md:py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <PawPrint className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--primary)' }} />
          <span
            className="font-bold text-base md:text-xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
          >
            犬旅びより
          </span>
        </Link>

        <nav className="flex items-center gap-3 md:gap-6 text-xs md:text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link href="/contact" className="hover:opacity-70 transition-opacity">
            お問い合わせ
          </Link>
          <Link
            href="/business-contact"
            className="kt-btn kt-btn--ghost"
            style={{ padding: '8px 14px', fontSize: 12 }}
          >
            <span className="hidden sm:inline">宿を掲載する</span>
            <span className="sm:hidden">掲載</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
