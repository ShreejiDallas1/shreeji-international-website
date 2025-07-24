'use client';

import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the HomePage component for better performance
const HomePage = lazy(() => import('@/components/HomePage'));

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomePage />
    </Suspense>
  );
}