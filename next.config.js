/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript 型チェックは有効（潜在バグ検出）
  // ESLint は any 型などのスタイル警告が多いので一旦ビルド妨害しない設定
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.travel.rakuten.co.jp' },
      { protocol: 'https', hostname: 'trvimg.r10s.jp' },
      { protocol: 'https', hostname: 'travel.rakuten.co.jp' },
      // microCMS メディア（手動入力画像）
      { protocol: 'https', hostname: 'images.microcms-assets.io' },
    ],
  },
};

export default nextConfig;
