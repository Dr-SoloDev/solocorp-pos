/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.DOCKER ? "standalone" : undefined,
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: [
    "@lekk/db",
    "@lekk/auth",
    "@lekk/ui",
    "@lekk/validators",
    "@lekk/config",
  ],
  experimental: {
    optimizePackageImports: ["@lekk/ui", "lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
