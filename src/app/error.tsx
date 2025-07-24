'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">
          We&apos;re sorry, but there was an error loading this page. Our team has been notified.
        </p>
        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={reset}
          >
            Try Again
          </Button>
          <div>
            <Link href="/" className="text-lime-600 hover:text-lime-700">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}