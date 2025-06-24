import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FavoritesProvider } from './context/FavoritesContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inutabi-biyori - 愛犬と泊まれる宿が見つかる、旅の検索サイト",
  description: "愛犬との最高の旅を、ここから。犬と一緒に泊まれる宿・ホテルを簡単検索。",
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
        <FavoritesProvider>
        {children}
        </FavoritesProvider>
      </body>
    </html>
  );
}
