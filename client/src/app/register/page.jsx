'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role');
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    let target = '/login?mode=signup';
    if (role === 'tutor') {
      target += '&role=tutor';
    } else if (role === 'student') {
      target += '&role=student';
    }
    if (redirect) {
      target += `&redirect=${encodeURIComponent(redirect)}`;
    }
    router.replace(target);
  }, [router, role, redirect]);

  return <LoadingSpinner text="Redirecting to portal..." />;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Redirecting to portal..." />}>
      <RegisterRedirect />
    </Suspense>
  );
}
