import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedTutorsShowcase from '../components/home/FeaturedTutorsShowcase';
import SubjectExplorer from '../components/home/SubjectExplorer';
import CityGrid from '../components/home/CityGrid';
import HowItWorks from '../components/home/HowItWorks';
import Testimonials from '../components/home/Testimonials';
import FAQ from '../components/home/FAQ';
import { api } from '../services/api';

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
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Top Verified Tutors Showcase */}
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
