'use client';

import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SecurityDashboard from '@/components/SecurityDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminSecurityPage() {
  const { user, loading, isAdmin } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/auth/login');
    }
  }, [user, loading, isAdmin, router]);

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading security dashboard..." />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <SecurityDashboard />
      </div>
    </div>
  );
}