'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProfileCompletionMeter from '../../components/common/ProfileCompletionMeter';

export default function TutorLayout({ children }) {
  const { user, tutorProfile } = useAuth();
  const pathname = usePathname();

  const isProfilePage = pathname === '/tutor/profile';
  const isChatPage = pathname?.startsWith('/tutor/messages');

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
