'use client';

import { useState } from 'react';

export default function SyncNowPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/sync-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to trigger sync'
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Manual Product Sync
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click the button below to immediately sync all products from Square to Firebase.
            This will update the website with the latest product information.
          </p>
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`px-6 py-3 rounded-lg font-medium ${
              syncing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {syncing ? 'Syncing...' : 'Sync Products Now'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <h3 className={`font-medium ${
                result.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
              }`}>
                {result.success ? '✅ Sync Successful' : '❌ Sync Failed'}
              </h3>
              <p className={`mt-2 ${
                result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
              }`}>
                {result.message || result.error}
              </p>
              {result.syncedCount !== undefined && (
                <div className="text-green-600 dark:text-green-400 mt-1 space-y-1">
                  <p>✅ Synced {result.syncedCount} products</p>
                  {result.deletedCount > 0 && (
                    <p>🗑️ Deleted {result.deletedCount} products (removed from Square)</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
            🔄 Automatic Sync Info
          </h3>
          <ul className="text-blue-700 dark:text-blue-400 space-y-1 text-sm">
            <li>• Products auto-sync every 2 minutes when accessed</li>
            <li>• Website cache updates every 1 minute</li>
            <li>• Static pages rebuild every 2 minutes</li>
            <li>• Changes in Square appear within 2-3 minutes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}