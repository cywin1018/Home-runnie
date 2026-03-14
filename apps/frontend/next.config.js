const DEFAULT_API_BASE_URL = 'http://localhost:3030';

const resolveApiBaseUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_BASE_URL;

  try {
    const url = new URL(rawUrl);

    // `/api`가 붙은 값을 넣거나 프론트 서버(3000)를 가리키면 프록시 루프가 발생할 수 있습니다.
    url.pathname = url.pathname.replace(/\/+$/, '').replace(/\/api$/, '');

    const isLocalFrontend =
      ['localhost', '127.0.0.1'].includes(url.hostname) && url.port === '3000';

    if (isLocalFrontend) {
      return DEFAULT_API_BASE_URL;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_API_BASE_URL;
  }
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiBaseUrl = resolveApiBaseUrl();

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
