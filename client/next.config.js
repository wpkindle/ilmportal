/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ilmportal.vercel.app',
          },
        ],
        destination: 'https://ilmidunya.com/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ilmportal-backend.onrender.com';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

