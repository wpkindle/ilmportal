export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/student/',
          '/tutor/',
          '/classroom/',
          '/api/',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: 'https://pakistanlms.pk/sitemap.xml',
  };
}

