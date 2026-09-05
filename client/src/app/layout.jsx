import './globals.css';
import AppProviders from '../components/common/AppProviders';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import NotificationPermissionPrompt from '../components/common/NotificationPermissionPrompt';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0c2217',
};

export const metadata = {
  metadataBase: new URL('https://pakistanlms.pk'),
  title: {
    default: 'IlmiDunya Pakistan | Verified Quran & Academic Tutoring',
    template: '%s | IlmiDunya Pakistan',
  },
  description: 'Connect with verified Pakistani Quran Qaris, female Alimahs, and Cambridge & Matric subject tutors. 1-on-1 live video classes with camera-off privacy from Lahore, Karachi, Islamabad & across Pakistan.',
  keywords: 'Quran tutor Pakistan, Tajweed tutor Lahore, O Level tutor Karachi, Online Quran Academy, Hifz tutor, Matric science tutor, Female Quran teacher Pakistan, In-platform WebRTC classroom',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IlmiDunya',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'IlmiDunya Pakistan | Verified Quran & Academic Tutoring',
    description: 'Connect with verified Pakistani Quran Qaris and Cambridge/Matric educators for live 1:1 in-platform video classrooms with complete family privacy.',
    url: 'https://pakistanlms.pk',
    siteName: 'IlmiDunya Pakistan',
    locale: 'en_PK',
    type: 'website',
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://pakistanlms.pk/#organization',
      name: 'IlmiDunya Pakistan',
      url: 'https://pakistanlms.pk',
      logo: 'https://pakistanlms.pk/logo.svg',
      description: 'Pakistan’s dedicated platform for 1-on-1 verified Quran and academic tutoring with camera-off privacy.',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'contact@ilmidunya.pk',
        contactType: 'customer support',
        areaServed: 'PK',
        availableLanguage: ['Urdu', 'English']
      },
      sameAs: [
        'https://facebook.com/ilmidunya',
        'https://twitter.com/ilmidunya'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://pakistanlms.pk/#website',
      url: 'https://pakistanlms.pk',
      name: 'IlmiDunya Pakistan',
      publisher: {
        '@id': 'https://pakistanlms.pk/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://pakistanlms.pk/tutors?q={search_term_string}',
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
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1c2826] font-sans antialiased selection:bg-[#143d2b] selection:text-white">
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
