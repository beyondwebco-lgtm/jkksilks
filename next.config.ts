import type { NextConfig } from "next";

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
let customR2Hostname: string | null = null;
if (r2PublicUrl) {
  try {
    const url = new URL(r2PublicUrl.startsWith('http') ? r2PublicUrl : `https://${r2PublicUrl}`);
    customR2Hostname = url.hostname;
  } catch {
    // Ignore invalid URL formatting
  }
}

const remotePatterns: Array<{ protocol: 'https' | 'http'; hostname: string }> = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
  },
  {
    protocol: 'https',
    hostname: 'pub-86931b9a48754ca69882abcca3e55951.r2.dev',
  },
  {
    protocol: 'https',
    hostname: '**.r2.dev',
  },
  {
    protocol: 'https',
    hostname: '**.cloudflarestorage.com',
  },
];

if (customR2Hostname && !remotePatterns.some(p => p.hostname === customR2Hostname)) {
  remotePatterns.push({
    protocol: 'https',
    hostname: customR2Hostname,
  });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
