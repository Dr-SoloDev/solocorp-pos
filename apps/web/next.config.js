/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.DOCKER ? "standalone" : undefined,
  transpilePackages: [
    "@solocorp/db",
    "@solocorp/auth",
    "@solocorp/ui",
    "@solocorp/validators",
    "@solocorp/config",
  ],
  experimental: {
    optimizePackageImports: ["@solocorp/ui", "lucide-react"],
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
