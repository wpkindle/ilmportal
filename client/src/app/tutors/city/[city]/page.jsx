import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, ArrowRight, ArrowLeft, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import TutorCard from '../../../../components/tutor/TutorCard';
import { api } from '../../../../services/api';

export const revalidate = 60;

const cityLocalContext = {
  lahore: {
    areas: 'DHA, Gulberg, Johar Town, Model Town, Bahria Town & Cantt',
    boards: 'BISE Lahore, Federal Board (FBISE), and Cambridge CAIE (O/A Levels)',
    popularSubjects: 'Tajweed al-Quran with Sanad, O-Level Physics/Math, FSc Pre-Medical, Noorani Qaida for Kids',
    description: 'Lahore is a historic center of academic excellence and Islamic scholarship. IlmPortal connects families across Lahore with verified local Qaris, qualified female Alimahs for daughters, and top Cambridge/Matric tuition specialists offering camera-off live 1:1 sessions.'
  },
  karachi: {
    areas: 'Clifton, DHA, Gulshan-e-Iqbal, PECHS, North Nazimabad & Malir Cantt',
    boards: 'BSEK Karachi, BIEK, Aga Khan University Board (AKU-EB), and Cambridge CAIE',
    popularSubjects: 'Cambridge CAIE O/A Levels, MDCAT Chemistry, Tajweed & Hifz Revision, Matric Science',
    description: 'Eliminate lengthy commutes across Shahrah-e-Faisal and University Road. Find vetted Karachi-based Quran teachers and school educators who deliver live interactive lessons directly to your home with complete family privacy.'
  },
  islamabad: {
    areas: 'Sectors F-6, F-7, F-8, F-10, F-11, G-11, DHA Islamabad & Bahria Town',
    boards: 'Federal Board (FBISE) and Cambridge International (CAIE)',
    popularSubjects: 'Noorani Qaida for Children, O/A Level Mathematics, HSSC Physics, Female Quran Teachers',
    description: 'Families in Islamabad and the twin cities trust IlmPortal for certified Quran Qaris with authenticated Sanads, and university scholars for Cambridge & Federal Board tutoring.'
  },
  rawalpindi: {
    areas: 'Bahria Town, Westridge, Saddar, Chaklala, Satellite Town & Askari',
    boards: 'BISE Rawalpindi and Federal Board (FBISE)',
    popularSubjects: 'Matric Class 9 & 10 Science, FSc Pre-Engineering, Nazra Quran, Hifz al-Quran',
    description: 'Connect with reputable Rawalpindi tutors for in-person home tutoring or flexible live video classes with verified CNIC documentation and transparent monthly rates.'
  },
  peshawar: {
    areas: 'Hayatabad, University Town, Peshawar Cantt & Warsak Road',
    boards: 'BISE Peshawar and Cambridge CAIE',
    popularSubjects: 'Tajweed-ul-Quran, Pre-Medical Biology, Noorani Qaida, Matric English',
    description: 'Verified Quran Qaris and subject specialists teaching students in Peshawar with genuine dedication, safe audio/video sessions, and camera-off privacy guarantees.'
  },
  quetta: {
    areas: 'Quetta Cantt, Jinnah Town, Samungli Road & Shahbaz Town',
    boards: 'BISE Balochistan and Federal Board (FBISE)',
    popularSubjects: 'Quran Reading with Tajweed, Matric Science, Entry Test Coaching',
    description: 'Access nationwide certified educators and local Quetta tutors for high-quality, private 1-on-1 online instruction without geographical barriers.'
  }
};

export async function generateMetadata({ params }) {
  const rawCity = decodeURIComponent(params.city);
  const cityKey = rawCity.toLowerCase();
  const formattedCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
  const context = cityLocalContext[cityKey];

  const title = `Online Quran & Academic Tutors in ${formattedCity} | IlmPortal Pakistan`;
  const description = context
    ? `Connect with verified Quran Qaris, female Alimahs, and Cambridge/Matric tutors in ${formattedCity}. Serving ${context.areas}. Safe 1:1 classes with camera-off privacy.`
    : `Find top-rated Quran teachers, female Alimahs, and Cambridge/Matric academic tutors available for live online classes and home tutoring in ${formattedCity}, Pakistan.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/tutors/city/${cityKey}`,
    },
    openGraph: {
      title: `Quran & Academic Tutors in ${formattedCity} - IlmPortal`,
      description,
      url: `https://pakistanlms.pk/tutors/city/${cityKey}`,
    }
  };
}

export default async function CityTutorsPage({ params }) {
  const rawCity = decodeURIComponent(params.city);
  const cityKey = rawCity.toLowerCase();
  const formattedCity = rawCity.charAt(0).toUpperCase() + rawCity.slice(1);
  const context = cityLocalContext[cityKey] || {
    areas: `Central areas and online students in ${formattedCity}`,
    boards: 'Matriculation, Intermediate Boards & Cambridge CAIE',
    popularSubjects: 'Tajweed al-Quran, Noorani Qaida, School Sciences & Math',
    description: `Connect with verified Pakistani Quran Qaris, female Alimahs, and Cambridge/Matric subject tutors available for students in ${formattedCity} and nationwide.`
  };

  let tutors = [];
  try {
    const res = await api.getTutors({ city: formattedCity });
    if (res && res.success) tutors = res.tutors || [];
  } catch (err) {
    console.error('SSR fetch error for city tutors:', err);
  }

  const citySchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        name: `IlmPortal Tutoring Network - ${formattedCity}`,
        url: `https://pakistanlms.pk/tutors/city/${cityKey}`,
        description: `Verified Quran and academic tutoring service for families in ${formattedCity}, Pakistan.`,
        areaServed: {
          '@type': 'City',
          name: formattedCity,
          containedInPlace: {
            '@type': 'Country',
            name: 'Pakistan'
          }
        },
        address: {
          '@type': 'PostalAddress',
          addressLocality: formattedCity,
          addressCountry: 'PK'
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
            name: 'Tutors Directory',
            item: 'https://pakistanlms.pk/tutors'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${formattedCity} Tutors`,
            item: `https://pakistanlms.pk/tutors/city/${cityKey}`
          }
        ]
      }
    ]
  };

  return (
    <div className="py-12 bg-[#faf8f5] min-h-screen">
      {/* City-Specific Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-semibold text-[#5c6e69]">
          <Link href="/" className="hover:text-[#143d2b] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/tutors" className="hover:text-[#143d2b] transition-colors">Tutors</Link>
          <span>/</span>
          <span className="text-[#141c19] font-bold">{formattedCity}</span>
        </nav>

        {/* City Hero Header */}
        <div className="bg-[#0c2217] text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4 border border-[#143d2b]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#143d2b] text-[#d4a359] text-xs font-bold border border-[#d4a359]/40">
            <MapPin className="w-3.5 h-3.5" />
            <span>{formattedCity}, Pakistan &bull; Online &amp; Home Tutoring</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-black text-white leading-tight">
            Verified Quran &amp; Academic Tutors in {formattedCity}
          </h1>

          <p className="text-xs sm:text-sm text-[#d1dbd6] max-w-3xl leading-relaxed">
            {context.description}
          </p>

          {/* Local Insights Strip */}
          <div className="pt-3 border-t border-[#143d2b] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#a3b8b0]">
            <div>
              <strong className="text-white block font-semibold mb-0.5">Popular Areas in {formattedCity}:</strong>
              <span>{context.areas}</span>
            </div>
            <div>
              <strong className="text-white block font-semibold mb-0.5">Exam Boards &amp; Curricula:</strong>
              <span>{context.boards}</span>
            </div>
          </div>
        </div>

        {/* Quick Filter Actions */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={`/tutors?city=${formattedCity}&gender=female`}
            className="px-3.5 py-1.5 rounded-full bg-[#f5f0e6] hover:bg-[#ebe3d3] text-[#0c2217] border border-[#ebe3d3] font-bold transition-all inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Female Alimahs in {formattedCity}</span>
          </Link>
          <Link
            href={`/tutors?city=${formattedCity}&category=tajweed-al-quran`}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f5f0e6] text-[#2d3a37] border border-[#ebe3d3] font-medium transition-all"
          >
            Quran Tajweed Tutors
          </Link>
          <Link
            href={`/tutors?city=${formattedCity}&category=o-level-cambridge`}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#f5f0e6] text-[#2d3a37] border border-[#ebe3d3] font-medium transition-all"
          >
            Cambridge O/A Level
          </Link>
        </div>

        {/* Tutors Count & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5c6e69]">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#141c19]">
              {tutors.length} Verified Tutors Teaching in {formattedCity}
            </h2>
            <span className="text-[11px] text-[#81928e]">All CNIC &amp; Sanad Audited</span>
          </div>

          {tutors.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#ebe3d3] space-y-4">
              <MapPin className="w-10 h-10 text-[#81928e] mx-auto" />
              <h3 className="font-serif font-bold text-[#141c19] text-base">No tutors physically based in {formattedCity} yet</h3>
              <p className="text-xs text-[#5c6e69] max-w-md mx-auto leading-relaxed">
                Connect with our certified online Quran Qaris and academic faculty who conduct interactive 1:1 lessons for students in {formattedCity} via our browser classroom.
              </p>
              <Link
                href="/tutors"
                className="inline-block px-5 py-2.5 bg-[#143d2b] hover:bg-[#1e543c] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Browse All Online Tutors
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <TutorCard key={tutor._id} tutor={tutor} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

