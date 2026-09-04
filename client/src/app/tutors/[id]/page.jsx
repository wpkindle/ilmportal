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
        alternates: {
          canonical: `https://pakistanlms.pk/tutors/${params.id}`,
        },
        openGraph: {
          title: `${tutorName} - Certified Tutor | IlmPortal`,
          description: tutor.bio?.slice(0, 160) || 'Verified Quran & Academic Tutor on IlmPortal Pakistan.',
          images: [tutor.user?.avatar || '/images/tutors/qari-huzaifa.jpg'],
        }
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    title: 'Tutor Profile | IlmPortal Pakistan',
    description: 'Find verified Quran and Academic tutors across Pakistan.',
    alternates: {
      canonical: `https://pakistanlms.pk/tutors/${params.id}`,
    },
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
        <Link href="/tutors" className="px-5 py-2.5 bg-[#0c2217] hover:bg-[#143d2b] text-[#faf8f5] rounded-xl text-xs font-bold inline-block shadow-sm">
          Browse Other Tutors
        </Link>
      </div>
    );
  }

  const tutorUser = tutor.user || {};
  const tutorName = tutorUser.name || 'Verified Tutor';

  // Schema.org Person & BreadcrumbList JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `https://pakistanlms.pk/tutors/${params.id}#person`,
        name: tutorName,
        jobTitle: tutor.qualifications || 'Verified Educator',
        description: tutor.bio || `${tutorName} is a verified tutor on IlmPortal Pakistan offering personalized 1:1 online classes.`,
        image: tutorUser.avatar || undefined,
        address: {
          '@type': 'PostalAddress',
          addressLocality: tutorUser.city || 'Pakistan',
          addressCountry: 'PK'
        },
        knowsAbout: [
          ...(tutor.subjects || []),
          ...(tutor.qualifications ? [tutor.qualifications] : [])
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: tutor.averageRating || 5.0,
          reviewCount: reviews.length || 1,
          bestRating: '5',
          worstRating: '1'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://pakistanlms.pk'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Tutors',
            item: 'https://pakistanlms.pk/tutors'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: tutorName,
            item: `https://pakistanlms.pk/tutors/${params.id}`
          }
        ]
      }
    ]
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

