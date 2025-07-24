'use client';

import React from 'react';
import Image from 'next/image';

export default function BasicTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Basic Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Image Test</h2>
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 w-full max-w-md mx-auto">
          <Image
            src="/images/spices.png"
            alt="Test Image"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
            unoptimized={true}
          />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Component Test</h2>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}