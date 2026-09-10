import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-86931b9a48754ca69882abcca3e55951.r2.dev',
      },
    ],
  },
};

export default nextConfig;
