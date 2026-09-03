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
  themeColor: '#020617',
};

export const metadata = {
  title: 'IlmPortal Pakistan - Quran & Academic Tutoring LMS',
  description: 'Pakistan’s #1 online tutoring platform for Quran recitation, Tajweed, Hifz, and Academic subjects (Matric, FSc, O/A Levels) across Lahore, Karachi, Islamabad, Peshawar, Quetta, and all cities.',
  keywords: 'Quran tutor Pakistan, Tajweed tutor Lahore, O Level tutor Karachi, Online Quran Academy, Hifz tutor, Matric science tutor, In-platform WebRTC classroom',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IlmPortal',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  openGraph: {
    title: 'IlmPortal Pakistan - Online Quran & Academic Tutoring',
    description: 'Connect with verified Pakistani Quran Qaris and Cambridge/Matric educators for live in-platform video classrooms.',
    url: 'https://pakistanlms.pk',
    siteName: 'IlmPortal Pakistan',
    locale: 'en_PK',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
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
