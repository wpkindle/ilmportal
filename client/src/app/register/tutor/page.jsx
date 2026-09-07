'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function TutorRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=tutor&mode=signup');
  }, [router]);

  return <LoadingSpinner text="Redirecting to Tutor Portal..." />;
}

export default function TutorRegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Redirecting to Tutor Portal..." />}>
      <TutorRegisterRedirect />
    </Suspense>
  );
}
