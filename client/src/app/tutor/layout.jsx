'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProfileCompletionMeter from '../../components/common/ProfileCompletionMeter';

export default function TutorLayout({ children }) {
  const { user, tutorProfile } = useAuth();
  const pathname = usePathname();

  // The tutor profile edit page renders its own in-page meter above the form
  const isProfilePage = pathname === '/tutor/profile';
  const isChatPage = pathname?.startsWith('/tutor/messages');

  return (
    <div className="min-h-screen bg-slate-50">
      {!isProfilePage && !isChatPage && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 -mb-2">
          <ProfileCompletionMeter user={user} tutorProfile={tutorProfile} />
        </div>
      )}
      {children}
    </div>
  );
}
