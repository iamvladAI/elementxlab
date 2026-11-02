import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.68.235', '192.168.0.112', 'localhost'],
  async headers() {
    return [
      {
        source: '/:all*(png|jpg|jpeg|webp|svg|mp4|mov)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

