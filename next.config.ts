import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Post images can come from the WordPress site or other hosts used in the content
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
