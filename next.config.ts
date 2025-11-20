import type { NextConfig } from "next";

const apiTarget =
  process.env.REMOTE_API_BASE_URL ||
  "https://api.rtbconnect.space/api/v1";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
