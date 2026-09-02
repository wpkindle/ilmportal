'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProfileCompletionMeter from '../../components/common/ProfileCompletionMeter';

export default function StudentLayout({ children }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // The profile edit page renders its own in-page meter above the form
  const isProfilePage = pathname === '/student/profile';

  return (
    <div className="min-h-screen bg-slate-50">
      {!isProfilePage && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 -mb-2">
          <ProfileCompletionMeter user={user} />
        </div>
      )}
      {children}
    </div>
  );
}
