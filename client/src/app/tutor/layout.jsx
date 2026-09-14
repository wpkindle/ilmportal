'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProfileCompletionMeter from '../../components/common/ProfileCompletionMeter';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TutorLayout({ children }) {
  const { user, tutorProfile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProfilePage = pathname === '/tutor/profile';
  const isChatPage = pathname?.startsWith('/tutor/messages');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace(`/login?role=tutor&redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'tutor') {
        if (user.role === 'student') {
          router.replace('/student/dashboard');
        } else if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/login');
        }
      }
    }
  }, [user, loading, pathname, router]);

  // While checking auth or redirecting, show LoadingSpinner - NEVER render protected children!
  if (loading || !user || user.role !== 'tutor') {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`${isChatPage ? 'flex-1 flex flex-col' : 'min-h-screen flex flex-col'} bg-[#faf8f5] text-stone-900 font-sans selection:bg-[#d4a359]/30`}>

      {/* Profile Completion Meter & Greeting Tab */}
      {!isProfilePage && !isChatPage && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full">
          <ProfileCompletionMeter user={user} tutorProfile={tutorProfile} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
