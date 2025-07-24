'use client';

import { useState } from 'react';
import Button from './Button';
import { FiRefreshCw, FiCheck, FiAlertTriangle } from 'react-icons/fi';

interface SyncButtonProps {
  className?: string;
  onSuccess?: () => void;
}

const SyncButton = ({ className = '', onSuccess }: SyncButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Syncing products from Google Sheets...', type: 'info' });

      // First clear all existing data
      await fetch('/api/clear-db', { method: 'POST' });
      
      // Call the API route to sync products
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: process.env.NEXT_PUBLIC_SYNC_API_KEY || 'shreeji_sync_api_2024',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to sync products');
      }

      // Store sync time in localStorage
      const syncTime = new Date().toISOString();
      localStorage.setItem('lastSync', syncTime);
      
      setMessage({ text: data.message, type: 'success' });
      setLastSyncTime(new Date().toLocaleTimeString());
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error syncing products:', error);
      setMessage({ text: error.message || 'Failed to sync products', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Button
        variant="primary"
        onClick={handleSync}
        isLoading={isLoading}
        leftIcon={!isLoading && <FiRefreshCw className={isLoading ? "animate-spin" : ""} />}
        className="mb-2 w-full"
      >
        Sync Products from Google Sheets
      </Button>
      
      {message && (
        <div 
          className={`text-sm px-4 py-3 rounded-md mt-2 w-full flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 
            message.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' : 
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
          }`}
        >
          {message.type === 'success' ? (
            <FiCheck className="mr-2 flex-shrink-0" />
          ) : message.type === 'error' ? (
            <FiAlertTriangle className="mr-2 flex-shrink-0" />
          ) : (
            <FiRefreshCw className="mr-2 animate-spin flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
      
      {lastSyncTime && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Last synced at: {lastSyncTime}
        </div>
      )}
    </div>
  );
};

export default SyncButton;