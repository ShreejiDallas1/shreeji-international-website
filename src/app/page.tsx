import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the HomePage component for better performance
const HomePage = lazy(() => import('@/components/HomePage'));

// Enable ISR with 1 hour revalidation (removed force-static due to client components)
export const revalidate = 3600;

export default function Home() {
  return (
    <Suspense fallback={<PageLoading />}>
      <HomePage />
    </Suspense>
  );
}