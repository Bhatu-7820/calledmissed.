/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We can leave typescript and eslint warning checks during build for high quality,
  // but let's keep it clean.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

module.exports = nextConfig;
