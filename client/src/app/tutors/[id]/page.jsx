import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  ShieldCheck,
  Award,
  Video,
  Home,
  MessageSquare,
  Star,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import RatingStars from '../../../components/common/RatingStars';
import SanadBadge, { SanadModal } from '../../../components/common/SanadBadge';
import { api } from '../../../services/api';
import TutorProfileClient from './TutorProfileClient';

export const revalidate = 60; // ISR revalidate every 60 seconds

// Dynamic SEO metadata generator
export async function generateMetadata({ params }) {
  try {
    const res = await api.getTutorById(params.id);
    if (res && res.success && res.tutor) {
      const tutor = res.tutor;
      const tutorName = tutor.user?.name || 'Verified Tutor';
      return {
        title: `${tutorName} - Verified Tutor Profile | IlmPortal Pakistan`,
        description: `${tutorName} (${tutor.user?.city || 'Pakistan'}) specializes in ${tutor.qualifications || 'Quran & Academic Tutoring'}. Rating: ${tutor.averageRating?.toFixed(1) || '5.0'}/5. In-platform live video classes available.`,
        openGraph: {
          title: `${tutorName} - Certified Tutor | IlmPortal`,
          description: tutor.bio?.slice(0, 160) || 'Verified Quran & Academic Tutor on IlmPortal Pakistan.',
          images: [tutor.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'],
        }
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    title: 'Tutor Profile | IlmPortal Pakistan',
    description: 'Find verified Quran and Academic tutors across Pakistan.',
  };
}

export default async function TutorProfilePage({ params }) {
  let tutor = null;
  let reviews = [];

  try {
    const [tutorRes, revRes] = await Promise.all([
      api.getTutorById(params.id),
      api.getTutorReviews(params.id)
    ]);
    if (tutorRes && tutorRes.success) tutor = tutorRes.tutor;
    if (revRes && revRes.success) reviews = revRes.reviews || [];
  } catch (err) {
    console.error('SSR fetch error for tutor profile:', err);
  }

  if (!tutor) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Tutor profile not found</h2>
        <Link href="/tutors" className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-block">
          Browse Other Tutors
        </Link>
      </div>
    );
  }

  const tutorUser = tutor.user || {};
  const tutorName = tutorUser.name || 'Verified Tutor';

  // Schema.org Person & Service JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: tutorName,
    jobTitle: tutor.qualifications || 'Tutor',
    address: {
      '@type': 'PostalAddress',
      addressLocality: tutorUser.city || 'Pakistan',
      addressCountry: 'PK'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tutor.averageRating || 5.0,
      reviewCount: reviews.length || 1,
      bestRating: '5',
      worstRating: '1'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TutorProfileClient tutor={tutor} reviews={reviews} id={params.id} />
    </>
  );
}

