'use client';

import React, { useState } from 'react';

export default function GoogleSheetsTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGoogleSheets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the API route instead of direct integration
      const response = await fetch('/api/test/sheets');
      const data = await response.json();
      
      setTestResult(data);
    } catch (err: any) {
      console.error('Google Sheets test error:', err);
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
      <h1 className="text-3xl font-bold mb-6">Google Sheets Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Google Sheets Integration Test</h2>
        
        <button
          onClick={testGoogleSheets}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Google Sheets Integration'}
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