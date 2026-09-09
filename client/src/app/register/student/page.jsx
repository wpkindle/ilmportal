'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function StudentRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login?role=student&mode=signup');
  }, [router]);

  return <LoadingSpinner />;
}

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StudentRegisterRedirect />
    </Suspense>
  );
}
