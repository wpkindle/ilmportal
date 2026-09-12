import './globals.css';
import AppProviders from '../components/common/AppProviders';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import NotificationPermissionPrompt from '../components/common/NotificationPermissionPrompt';
import SiteAmbientBackdrop from '../components/common/SiteAmbientBackdrop';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0c2217',
  interactiveWidget: 'resizes-content',
};

export const metadata = {
  metadataBase: new URL('https://ilmidunya.com'),
  title: {
    default: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
    template: '%s | ilmidunya Pakistan',
  },
  description: 'ilmidunya Pakistan connects verified Quran Qaris, certified female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan. Find verified home and online tutors with camera-off privacy by default.',
  keywords: 'ilmidunya Pakistan, Connecting Verified Tutors With Students Across Pakistan, home tutor Lahore, home tutor Karachi, home tutor Islamabad, Quran tutor Pakistan, female Alimah tutor, Tajweed tutor, Matric tutor, FSc tutor Pakistan',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ilmidunya Pakistan',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'geo.region': 'PK',
    'geo.placename': 'Pakistan',
    'geo.position': '30.3753;69.3451',
    'ICBM': '30.3753, 69.3451',
  },
  openGraph: {
    title: 'ilmidunya Pakistan - Connecting Verified Tutors With Students Across Pakistan',
    description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Playgroup to FSc educators for live 1:1 classes and home tuitions across Pakistan.',
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
    description: 'Connect with verified Pakistani Quran Qaris, certified female Alimahs, and Playgroup to FSc educators for live 1:1 classes and home tuitions across Pakistan.',
    images: ['https://ilmidunya.com/logo-master.png'],
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'EducationalOrganization'],
      '@id': 'https://ilmidunya.com/#organization',
      name: 'ilmidunya Pakistan',
      alternateName: ['IlmiDunya', 'Ilmi Dunya'],
      url: 'https://ilmidunya.com',
      logo: 'https://ilmidunya.com/logo-master.png',
      image: 'https://ilmidunya.com/logo-master.png',
      description: 'Pakistan’s dedicated platform connecting verified Quran Qaris, female Alimahs, and Playgroup to FSc academic tutors with students across Pakistan.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@ilmidunya.com',
        contactType: 'customer support',
        areaServed: 'PK',
        availableLanguage: ['Urdu', 'English']
      },
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
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-site-canvas text-[#1c2826] font-sans antialiased selection:bg-[#143d2b] selection:text-white relative">
        <SiteAmbientBackdrop />
        <AppProviders>
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <NotificationPermissionPrompt />
        </AppProviders>
      </body>
    </html>
  );
}
