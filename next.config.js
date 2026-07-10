const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "bootstrap-icons"],
  },
  serverExternalPackages: ["pg", "bcryptjs"],
};

module.exports = withNextIntl(nextConfig);
