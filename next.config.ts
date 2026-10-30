import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow production checks without touching the running development server.
  distDir: process.env.NEXT_BUILD_DIR || '.next',
};

export default nextConfig;
