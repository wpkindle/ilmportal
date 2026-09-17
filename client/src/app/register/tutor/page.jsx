'use client';

import React, { Suspense } from 'react';
import TutorMultiStepRegister from '../../../components/auth/TutorMultiStepRegister';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function TutorRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
          <LoadingSpinner />
        </div>
      }
    >
      <TutorMultiStepRegister />
    </Suspense>
  );
}

