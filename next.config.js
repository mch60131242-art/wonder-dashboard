/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // xlsx 등이 브라우저 번들에서 node 코어 모듈을 require 하려 할 때 빌드 실패 방지
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      crypto: false,
      stream: false,
      path: false,
    };
    return config;
  },
};
module.exports = nextConfig;
