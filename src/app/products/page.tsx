'use client';

import { Suspense, lazy } from 'react';
import { PageLoading } from '@/components/LoadingSpinner';

// Lazy load the optimized products page
const ProductsPageOptimized = lazy(() => import('@/components/ProductsPageOptimized'));

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <ProductsPageOptimized />
    </Suspense>
  );
}