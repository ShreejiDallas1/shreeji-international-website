'use client';

import React, { useState } from 'react';

export default function SyncTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSync = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API route
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'shreeji_sync_api_2024',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to sync products');
      }
      
      setTestResult({
        success: true,
        ...data
      });
    } catch (err: any) {
      console.error('Sync test error:', err);
      setError(err.message || 'Unknown error');
      setTestResult({
        success: false,
        error: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sync Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">API Sync Test</h2>
        
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md mb-4">
          <p className="font-semibold">Note:</p>
          <p>This will sync products from Google Sheets to Firestore using the API route.</p>
        </div>
        
        <button
          onClick={testSync}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Syncing...' : 'Test Sync'}
        </button>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {testResult && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <p className="font-semibold mb-2">Test Results:</p>
            <pre className="text-xs overflow-auto max-h-60">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}