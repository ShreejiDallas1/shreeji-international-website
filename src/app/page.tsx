'use client';

import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the HomePage component for better performance
const HomePage = lazy(() => import('@/components/HomePage'));

// Enable static generation for homepage
export const revalidate = 3600; // 1 hour
export const dynamic = 'force-static';

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomePage />
    </Suspense>
  );
}