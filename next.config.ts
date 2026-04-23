import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/landing", destination: "/", permanent: true }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Bunny Stream thumbnail/preview trên CDN pull zone mặc định
      // (hostname chuẩn: vz-<hash>-<region>.b-cdn.net).
      {
        protocol: "https",
        hostname: "*.b-cdn.net",
      },
    ],
  },
};

export default nextConfig;
