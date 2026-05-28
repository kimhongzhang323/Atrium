import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    cacheComponents: true,
  },
  typedRoutes: true,
};

export default config;
