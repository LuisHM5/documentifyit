/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@documentifyit/ui', '@documentifyit/shared'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
