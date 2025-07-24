'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppContext } from '@/lib/context';
import { FiSettings, FiDatabase, FiKey, FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user } = useAppContext();
  const { isAdmin } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({
    firebase: null as boolean | null,
    sheets: null as boolean | null,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/admin/settings');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [user, isAdmin, router]);

  const testFirebaseConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/firebase');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, firebase: data.success }));
      
      if (data.success) {
        toast.success('Firebase connection successful');
      } else {
        toast.error('Firebase connection failed');
      }
    } catch (error) {
      console.error('Firebase test error:', error);
      setTestResults(prev => ({ ...prev, firebase: false }));
      toast.error('Firebase test failed');
    } finally {
      setLoading(false);
    }
  };

  const testSheetsConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/test/sheets');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, sheets: data.success }));
      
      if (data.success) {
        toast.success('Google Sheets connection successful');
      } else {
        toast.error('Google Sheets connection failed');
      }
    } catch (error) {
      console.error('Sheets test error:', error);
      setTestResults(prev => ({ ...prev, sheets: false }));
      toast.error('Google Sheets test failed');
    } finally {
      setLoading(false);
    }
  };

  const forceSyncProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sync-products?key=shreeji_sync_api_2024');
      const data = await response.json();
      
      if (data.success) {
        toast.success('Products synced successfully');
      } else {
        toast.error('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      setLoading(true);
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      toast.success('Cache cleared successfully');
      
      // Reload page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Cache clear error:', error);
      toast.error('Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: boolean | null }) => {
    if (status === null) return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    return status ? (
      <FiCheck className="w-4 h-4 text-green-500" />
    ) : (
      <FiX className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
      </div>

      {/* Connection Tests */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiDatabase className="mr-2" />
          Connection Tests
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <StatusIcon status={testResults.firebase} />
              <span className="ml-3 text-gray-900 dark:text-white">Firebase Connection</span>
            </div>
            <button
              onClick={testFirebaseConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Test Firebase
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <StatusIcon status={testResults.sheets} />
              <span className="ml-3 text-gray-900 dark:text-white">Google Sheets Connection</span>
            </div>
            <button
              onClick={testSheetsConnection}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Test Sheets
            </button>
          </div>
        </div>
      </div>

      {/* System Actions */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiSettings className="mr-2" />
          System Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Sync Products</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Manually sync products from Google Sheets to Firebase
            </p>
            <button
              onClick={forceSyncProducts}
              disabled={loading}
              className="w-full px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className="inline mr-2" />
              Force Sync
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Clear Cache</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Clear browser cache and local storage
            </p>
            <button
              onClick={clearCache}
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FiKey className="mr-2" />
          Environment Information
        </h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Environment:</span>
            <span className="text-gray-900 dark:text-white font-mono">
              {process.env.NODE_ENV || 'development'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Firebase Project:</span>
            <span className="text-gray-900 dark:text-white font-mono">
              shreeji-international
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Admin User:</span>
            <span className="text-gray-900 dark:text-white font-mono">
              {user?.email || 'Not logged in'}
            </span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Warning:</strong> These are system-level settings. 
              Only make changes if you understand the implications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}