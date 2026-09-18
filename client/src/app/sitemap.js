export const revalidate = 3600; // Cache and revalidate sitemap every 1 hour

export default async function sitemap() {
  const baseUrl = 'https://ilmidunya.com';
  const now = new Date();

  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' },
    { route: '/tutors', priority: 0.95, changeFrequency: 'daily' },
    { route: '/courses', priority: 0.9, changeFrequency: 'weekly' },
    { route: '/articles', priority: 0.9, changeFrequency: 'daily' },
    { route: '/how-it-works', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/safety', priority: 0.8, changeFrequency: 'monthly' },
    { route: '/about-us', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/contact-us', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/login', priority: 0.6, changeFrequency: 'monthly' },
    { route: '/register/tutor', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/register/student', priority: 0.7, changeFrequency: 'monthly' },
    { route: '/privacy-policy', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/terms', priority: 0.4, changeFrequency: 'yearly' },
    { route: '/disclaimer', priority: 0.4, changeFrequency: 'yearly' },
  ];

  const majorCities = [
    'lahore',
    'karachi',
    'islamabad',
    'rawalpindi',
    'faisalabad',
    'multan',
    'peshawar',
    'quetta',
    'gujranwala',
    'sialkot',
    'sargodha',
    'bahawalpur',
    'hyderabad',
    'sukkur',
    'abbottabad',
    'mardan',
    'gujrat',
    'jhelum',
    'sahiwal',
    'sheikhupura',
    'rahim-yar-khan',
    'muzaffarabad',
    'mirpur',
    'gilgit',
    'skardu',
    'okara',
    'kasur',
    'dera-ghazi-khan',
    'swat',
    'mingora',
    'turbat',
    'gwadar',
    'khuzdar',
    'mansehra',
    'attock',
    'jhang',
    'wah-cantt',
    'taxila',
    'mianwali'
  ];

  const subjects = [
    'tajweed-al-quran',
    'nazra-quran',
    'hifz-al-quran',
    'quran-translation-tafseer',
    'noorani-qaida',
    'islamic-studies-fiqh',
    'arabic-grammar-spoken',
    'matric-ssc-science',
    'fsc-hssc',
    'fsc-pre-engineering',
    'o-level-cambridge',
    'a-level-cambridge',
    'computer-science-coding',
    'spoken-english-ielts',
    'primary-school-1-to-5',
    'middle-school-academic',
    'political-science',
    'civics',
    'pakistan-ideology',
    'constitution-law',
    'board-exam-prep',
    'entry-test-prep',
    'hifz-ul-quran-specialist'
  ];

  const sitemapEntries = [
    // 1. Static Core Landing Pages
    ...staticRoutes.map((item) => ({
      url: `${baseUrl}${item.route}`,
      lastModified: now,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })),

    // 2. City-Based SEO Landing Pages
    ...majorCities.map((city) => ({
      url: `${baseUrl}/tutors/city/${city}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    })),

    // 3. Subject-Specific Landing Pages & Filter Queries
    ...subjects.flatMap((sub) => [
      {
        url: `${baseUrl}/tutors/subject/${sub}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.85,
      },
      {
        url: `${baseUrl}/tutors?category=${sub}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.80,
      }
    ]),
  ];

  // 4. Query Dynamic Content (Tutors, Articles, Courses) safely with timeout
  try {
    const apiBase = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://ilmportal-backend.onrender.com/api';

    // Fetch approved tutors
    try {
      const tutorController = new AbortController();
      const tutorTimer = setTimeout(() => tutorController.abort(), 3500);
      const tutorRes = await fetch(`${apiBase}/tutors?limit=100`, {
        signal: tutorController.signal,
        next: { revalidate: 3600 }
      });
      clearTimeout(tutorTimer);
      if (tutorRes.ok) {
        const data = await tutorRes.json();
        if (Array.isArray(data.tutors)) {
          for (const t of data.tutors) {
            if (t._id) {
              sitemapEntries.push({
                url: `${baseUrl}/tutors/${t._id}`,
                lastModified: t.updatedAt ? new Date(t.updatedAt) : now,
                changeFrequency: 'weekly',
                priority: 0.80,
              });
            }
          }
        }
      }
    } catch (_) {}

    // Fetch published articles
    try {
      const articleController = new AbortController();
      const articleTimer = setTimeout(() => articleController.abort(), 3500);
      const articleRes = await fetch(`${apiBase}/articles?limit=100`, {
        signal: articleController.signal,
        next: { revalidate: 3600 }
      });
      clearTimeout(articleTimer);
      if (articleRes.ok) {
        const data = await articleRes.json();
        if (Array.isArray(data.articles)) {
          for (const a of data.articles) {
            if (a.slug) {
              sitemapEntries.push({
                url: `${baseUrl}/articles/${a.slug}`,
                lastModified: a.updatedAt ? new Date(a.updatedAt) : (a.publishedAt ? new Date(a.publishedAt) : now),
                changeFrequency: 'weekly',
                priority: 0.80,
              });
            }
          }
        }
      }
    } catch (_) {}

    // Fetch active courses
    try {
      const courseController = new AbortController();
      const courseTimer = setTimeout(() => courseController.abort(), 3500);
      const courseRes = await fetch(`${apiBase}/courses?limit=100`, {
        signal: courseController.signal,
        next: { revalidate: 3600 }
      });
      clearTimeout(courseTimer);
      if (courseRes.ok) {
        const data = await courseRes.json();
        if (Array.isArray(data.courses)) {
          for (const c of data.courses) {
            if (c.slug) {
              sitemapEntries.push({
                url: `${baseUrl}/courses/${c.slug}`,
                lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
                changeFrequency: 'weekly',
                priority: 0.80,
              });
            }
          }
        }
      }
    } catch (_) {}
  } catch (_) {}

  return sitemapEntries;
}
