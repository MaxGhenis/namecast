import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy API requests to the Modal backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://namecast--api.modal.run/:path*",
      },
    ];
  },
};

export default nextConfig;
