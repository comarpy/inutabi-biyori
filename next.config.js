/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.travel.rakuten.co.jp' },
      { protocol: 'https', hostname: 'trvimg.r10s.jp' },
      { protocol: 'https', hostname: 'travel.rakuten.co.jp' },
    ],
  },
};

export default nextConfig;
