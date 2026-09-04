export default async function sitemap() {
  const baseUrl = 'https://pakistanlms.pk';

  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/tutors', priority: 0.9, changeFrequency: 'daily' },
    { route: '/courses', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/safety', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/about-us', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact-us', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/register/student', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/register/tutor', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/disclaimer', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const majorCities = [
    'lahore',
    'karachi',
    'islamabad',
    'rawalpindi',
    'peshawar',
    'quetta',
    'faisalabad',
    'multan',
    'hyderabad',
    'abbottabad',
  ];

  const categories = [
    'tajweed-al-quran',
    'noorani-qaida',
    'hifz-al-quran',
    'o-level-cambridge',
    'a-level-cambridge',
    'fsc-pre-engineering',
    'fsc-hssc',
    'matric-ssc-science',
    'entry-test-prep',
  ];

  const sitemapEntries = [
    ...staticRoutes.map((item) => ({
      url: `${baseUrl}${item.route}`,
      lastModified: new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),
    ...majorCities.map((city) => ({
      url: `${baseUrl}/tutors/city/${city}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/tutors?category=${cat}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];

  return sitemapEntries;
}

