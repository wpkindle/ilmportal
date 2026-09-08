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
  title: 'Verified Qaris, Alimahs & Academic Tutors in Pakistan | Female-Safe | IlmiDunya',
  description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Playgroup to FSc tutors. Designed especially for female privacy & comfort with camera-off classes by default.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Verified Qaris, Alimahs & Academic Tutors in Pakistan | IlmiDunya',
    description: 'Connect with verified Pakistani Quran Qaris, female Alimahs, and Playgroup to FSc educators with camera-off privacy by default.',
    url: 'https://ilmidunya.com',
    siteName: 'IlmiDunya',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verified Qaris, Alimahs & Academic Tutors in Pakistan | IlmiDunya',
    description: 'Connect with verified Pakistani Quran Qaris, female Alimahs, and Playgroup to FSc educators with camera-off privacy by default.',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://ilmidunya.com/#organization',
      name: 'IlmiDunya',
      url: 'https://ilmidunya.com',
      logo: 'https://ilmidunya.com/icon.svg',
      description: 'Pakistan’s premier educational network connecting families with verified Quran Qaris, female Alimahs, and Playgroup to FSc tutors.',
      email: 'info@ilmidunya.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Lahore',
        addressRegion: 'Punjab',
        addressCountry: 'PK'
      },
      areaServed: [
        { '@type': 'City', name: 'Lahore' },
        { '@type': 'City', name: 'Karachi' },
        { '@type': 'City', name: 'Islamabad' },
        { '@type': 'City', name: 'Rawalpindi' },
        { '@type': 'City', name: 'Peshawar' },
        { '@type': 'City', name: 'Quetta' },
        { '@type': 'City', name: 'Faisalabad' },
        { '@type': 'City', name: 'Multan' }
      ]
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
    }
  ]
};

export const revalidate = 60; // SSR with ISR caching every 60s

async function getFeaturedTutors() {
  try {
    const res = await api.getPublicTutors({ limit: 6, sortBy: 'rating' });
    if (res && res.success) {
      return res.tutors || [];
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
