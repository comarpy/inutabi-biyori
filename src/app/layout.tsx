import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://inutabi-biyori.com";
const SITE_NAME = "犬旅びより";
const SITE_DESCRIPTION =
  "愛犬との最高の旅を、ここから。犬と一緒に泊まれる宿・ホテルを簡単検索。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 愛犬と泊まれる宿が見つかる、旅の検索サイト`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "犬と泊まれる宿",
    "ペット可ホテル",
    "ドッグラン",
    "愛犬旅行",
    "ペット同伴旅館",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - 愛犬と泊まれる宿が見つかる、旅の検索サイト`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/images/画像2.jpeg",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 愛犬と泊まれる宿が見つかる、旅の検索サイト`,
    description: SITE_DESCRIPTION,
    images: ["/images/画像2.jpeg"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
