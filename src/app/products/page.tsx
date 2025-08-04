import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the optimized products page
const ProductsPageOptimized = lazy(() => import('@/components/ProductsPageOptimized'));

// Enable ISR with 2 minute revalidation for real-time updates
export const revalidate = 120;

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProductsPageOptimized />
    </Suspense>
  );
}