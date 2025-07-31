import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the optimized products page
const ProductsPageOptimized = lazy(() => import('@/components/ProductsPageOptimized'));

// Enable ISR with 1 hour revalidation to reduce function calls
export const revalidate = 3600;

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProductsPageOptimized />
    </Suspense>
  );
}