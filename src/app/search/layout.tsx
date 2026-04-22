import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "宿を検索する",
  description:
    "エリア・日程・詳細条件で、愛犬と泊まれる宿を検索できます。ドッグラン・温泉・大型犬OKなど、こだわりで絞り込みも。",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
