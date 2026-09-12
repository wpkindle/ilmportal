import React from 'react';
import Hero from '../components/home/Hero';
import SafetyShowcase from '../components/home/SafetyShowcase';
import FeaturedTutorsShowcase from '../components/home/FeaturedTutorsShowcase';
import SubjectExplorer from '../components/home/SubjectExplorer';
import CityGrid from '../components/home/CityGrid';
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';
import LatestArticlesSection from '../components/home/LatestArticlesSection';
import { api } from '../services/api';

export const metadata = {
  title: {
    absolute: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
  },
  description: 'ilmidunya Pakistan connects verified Quran Qaris, certified female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan. Find verified home and online tutors in Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Faisalabad, Multan & nationwide.',
  keywords: [
    'ilmidunya Pakistan',
    'Connecting Verified Tutors With Students Across Pakistan',
    'home tutors Pakistan',
    'online tutor Pakistan',
    'female Quran teacher Pakistan',
    'Alimah tutor online',
    'home tutor Lahore',
    'home tutor Karachi',
    'home tutor Islamabad',
    'home tutor Rawalpindi',
    'Tajweed tutor Pakistan',
    'Noorani Qaida teacher',
    'Matric science tutor',
    'FSc tutor Pakistan',
    'entry test preparation Pakistan',
    'Wafaq ul Madaris certified Qari'
  ].join(', '),
  alternates: {
    canonical: 'https://ilmidunya.com',
  },
  openGraph: {
    title: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
    description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan. 1-on-1 home tuitions and live in-browser classes with camera-off privacy.',
    url: 'https://ilmidunya.com',
    siteName: 'ilmidunya Pakistan',
    locale: 'en_PK',
    type: 'website',
    images: [
      {
        url: 'https://ilmidunya.com/logo-master.png',
        width: 1200,
        height: 630,
        alt: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
    description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan.',
    images: ['https://ilmidunya.com/logo-master.png'],
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['EducationalOrganization', 'LocalBusiness'],
      '@id': 'https://ilmidunya.com/#organization',
      name: 'ilmidunya Pakistan',
      alternateName: ['IlmiDunya', 'Ilmi Dunya', 'ilmidunya.com'],
      url: 'https://ilmidunya.com',
      logo: 'https://ilmidunya.com/logo-master.png',
      image: 'https://ilmidunya.com/logo-master.png',
      description: 'Pakistan’s premier educational platform connecting verified Quran Qaris, certified female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan.',
      email: 'info@ilmidunya.com',
      priceRange: 'PKR',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        addressCountry: 'PK'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 31.5204,
        longitude: 74.3587
      },
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Pakistan' },
        { '@type': 'City', name: 'Lahore' },
        { '@type': 'City', name: 'Karachi' },
        { '@type': 'City', name: 'Islamabad' },
        { '@type': 'City', name: 'Rawalpindi' },
        { '@type': 'City', name: 'Peshawar' },
        { '@type': 'City', name: 'Quetta' },
        { '@type': 'City', name: 'Faisalabad' },
        { '@type': 'City', name: 'Multan' },
        { '@type': 'City', name: 'Hyderabad' },
        { '@type': 'City', name: 'Gujranwala' },
        { '@type': 'City', name: 'Sialkot' },
        { '@type': 'City', name: 'Abbottabad' }
      ],
      knowsAbout: [
        'Quran Recitation with Tajweed',
        'Noorani Qaida for Kids & Beginners',
        'Hifz al-Quran Memorization',
        'Female Alimah Islamic Scholarship',
        'FBISE & BISE Matric Science Tuitions',
        'FSc Pre-Medical & Pre-Engineering Tutoring',
        'Home Tuition across Pakistan',
        'Online WebRTC 1-on-1 Tutoring'
      ],
      sameAs: [
        'https://www.facebook.com/ilmidunyapakistan',
        'https://www.instagram.com/ilmidunya_com',
        'https://www.youtube.com/@ilmidunyapakistan',
        'https://whatsapp.com/channel/0029VbDT9HCI7Be90yESwo3y'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ilmidunya.com/#website',
      url: 'https://ilmidunya.com',
      name: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
      publisher: {
        '@id': 'https://ilmidunya.com/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ilmidunya.com/tutors?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://ilmidunya.com'
        }
      ]
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does ilmidunya Pakistan connect verified tutors with students?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'ilmidunya Pakistan allows students and parents to search verified Quran Qaris, female Alimahs, and academic school/college tutors by city, area, subject, and gender. You can message tutors directly inside the portal and arrange home tuitions or live online WebRTC classes.'
          }
        },
        {
          '@type': 'Question',
          name: 'Do you ask for or require personal phone numbers or WhatsApp?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, never. ilmidunya Pakistan operates on a strict zero phone/WhatsApp collection policy. All discussions, scheduling, and learning take place safely within the portal to ensure total privacy for students, daughters, and teachers.'
          }
        },
        {
          '@type': 'Question',
          name: 'How are tutors and religious Sanads verified on ilmidunya Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every educator undergoes a manual verification procedure including CNIC identity check, Wafaq-ul-Madaris Shahadat-ul-Alimiyyah Sanad authentication, and academic degree validation from Pakistani educational boards and universities.'
          }
        },
        {
          '@type': 'Question',
          name: 'Are female tutors available for daughters and female students in Pakistan?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We have certified female Alimahs and academic female tutors available for 100% online WebRTC classes with camera-off privacy by default, ensuring maximum modesty and comfort.'
          }
        }
      ]
    }
  ]
};

export const revalidate = 60; // SSR with ISR caching every 60s

async function getFeaturedTutors() {
  try {
    const res = await api.getPublicTutors({ limit: 6, sortBy: 'rating' });
    if (res && res.success && Array.isArray(res.tutors)) {
      return res.tutors;
    }
  } catch (err) {
    console.error('SSR fetch error for featured tutors:', err);
  }
  return [];
}

async function getLatestArticles() {
  try {
    const res = await api.getArticles({ limit: 3 });
    if (res && res.success) {
      return res.articles || [];
    }
  } catch (err) {
    console.error('SSR fetch error for latest articles:', err);
  }
  return [];
}

export default async function HomePage() {
  const [featuredTutors, latestArticles] = await Promise.all([
    getFeaturedTutors(),
    getLatestArticles()
  ]);

  return (
    <div className="space-y-0">
      {/* Search Engine Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeStructuredData) }}
      />

      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Platform Safety & Trust Showcase */}
      <SafetyShowcase />

      {/* 3. Top Verified Tutors Showcase */}
      <FeaturedTutorsShowcase initialTutors={featuredTutors} />

      {/* 4. Subject Disciplines Explorer */}
      <SubjectExplorer />

      {/* 5. Pakistan City Coverage Grid */}
      <CityGrid />

      {/* 6. How It Works Flow */}
      <HowItWorks />

      {/* 7. Founders' Articles & Insights */}
      <LatestArticlesSection initialArticles={latestArticles} />

      {/* 8. FAQs */}
      <FAQ />
    </div>
  );
}
