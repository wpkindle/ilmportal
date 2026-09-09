import React from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function RootLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <LoadingSpinner size="lg" />
    </div>
  );
}
