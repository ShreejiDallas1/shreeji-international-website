'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

// This page redirects to the new verification code flow
export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the forgot password page since we now use verification codes
    router.replace('/auth/forgot-password');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-400">Redirecting to password reset...</p>
      </div>
    </div>
  );
}