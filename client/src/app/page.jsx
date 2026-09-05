import React from 'react';
import Hero from '../components/home/Hero';
import SafetyShowcase from '../components/home/SafetyShowcase';
import FeaturedTutorsShowcase from '../components/home/FeaturedTutorsShowcase';
import SubjectExplorer from '../components/home/SubjectExplorer';
import CityGrid from '../components/home/CityGrid';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import { api } from '../services/api';

export const metadata = {
  title: 'Verified Qaris, Alimahs & Academic Tutors in Pakistan | Female-Safe | IlmiDunya',
  description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Cambridge/Matric tutors. Designed especially for female privacy & comfort with camera-off classes by default.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Verified Qaris, Alimahs & Academic Tutors in Pakistan | IlmiDunya',
    description: 'Connect with verified Pakistani Quran Qaris, female Alimahs, and Cambridge/Matric educators with camera-off privacy by default.',
    url: 'https://pakistanlms.pk',
  },
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://pakistanlms.pk/#organization',
      name: 'IlmiDunya Pakistan',
      url: 'https://pakistanlms.pk',
      logo: 'https://pakistanlms.pk/icon.svg',
      description: 'Pakistan’s premier educational network connecting families with verified Quran Qaris, female Alimahs, and Cambridge/Matric tutors.',
      email: 'contact@ilmidunya.pk',
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
          item: 'https://pakistanlms.pk'
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

export default async function HomePage() {
  const featuredTutors = await getFeaturedTutors();

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

      {/* 3. Subject Disciplines Explorer */}
      <SubjectExplorer />

      {/* 4. Pakistan City Coverage Grid */}
      <CityGrid />

      {/* 5. How It Works Flow */}
      <HowItWorks />

      {/* 6. Authentic Testimonials */}
      <Testimonials />

      {/* 7. FAQs */}
      <FAQ />
    </div>
  );
}
