/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030';

    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${apiBaseUrl}/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
