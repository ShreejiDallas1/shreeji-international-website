'use client';

import { useState } from 'react';
import { FiRefreshCw, FiCheck, FiAlertTriangle, FiDatabase, FiFileText, FiCreditCard, FiInfo } from 'react-icons/fi';
import Button from '@/components/Button';
import FirebaseTest from '@/components/FirebaseTest';

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [sheetsTestResult, setSheetsTestResult] = useState<any>(null);
  const [squareTestResult, setSquareTestResult] = useState<any>(null);

  // Function to test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Testing Firebase connection...', type: 'info' });

      const response = await fetch('/api/test/firebase', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to test Firebase connection');
      }

      setTestResult(data);
      setMessage({ text: 'Firebase connection test completed', type: 'success' });
    } catch (error: any) {
      console.error('Error testing Firebase connection:', error);
      setMessage({ text: error.message || 'Failed to test Firebase connection', type: 'error' });
      setTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to test Google Sheets connection (DEACTIVATED)
  const testGoogleSheetsConnection = async () => {
    setMessage({ text: 'Google Sheets sync is currently deactivated. Using Square inventory instead.', type: 'info' });
    setSheetsTestResult({ 
      deactivated: true, 
      message: 'Google Sheets integration is disabled in favor of Square inventory management.' 
    });
  };

  // Function to test Square connection
  const testSquareConnection = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Testing Square connection...', type: 'info' });

      const response = await fetch('/api/square/config', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to test Square connection');
      }

      setSquareTestResult(data);
      setMessage({ text: 'Square connection test completed', type: 'success' });
    } catch (error: any) {
      console.error('Error testing Square connection:', error);
      setMessage({ text: error.message || 'Failed to test Square connection', type: 'error' });
      setSquareTestResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sync products from Square
  const handleSync = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Syncing products from Square...', type: 'info' });

      // First test Firebase permissions
      const firebaseTestResponse = await fetch('/api/test/firebase');
      const firebaseTestData = await firebaseTestResponse.json();
      
      if (!firebaseTestResponse.ok || !firebaseTestData.connected) {
        throw new Error(`Firebase connection error: ${firebaseTestData.error || 'Unknown error'}`);
      }
      
      // Then test Square connection
      const squareTestResponse = await fetch('/api/square/config');
      const squareTestData = await squareTestResponse.json();
      
      if (!squareTestResponse.ok || !squareTestData.connected) {
        throw new Error(`Square connection error: ${squareTestData.error || 'Unknown error'}`);
      }
      
      // If both tests pass, proceed with Square sync
      const response = await fetch('/api/square/sync-products', {
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
        throw new Error(data.error || data.details || 'Failed to sync products from Square');
      }

      setMessage({ text: data.message || 'Successfully synced products from Square', type: 'success' });
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (error: any) {
      console.error('Error syncing products:', error);
      setMessage({ text: error.message || 'Failed to sync products from Square', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Data Synchronization</h1>
      
      {/* Inventory Source Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg mb-6">
        <div className="flex items-center">
          <FiInfo className="text-blue-500 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Primary Inventory System: Square</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Products are now managed through Square POS system. Google Sheets integration has been deactivated.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Firebase Connection Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiDatabase className="mr-2 text-orange-500" />
            Firebase Connection Test
          </h2>
          
          <FirebaseTest />
          
          <div className="mt-4 border-t pt-4">
            <Button
              variant="outline"
              onClick={testFirebaseConnection}
              isLoading={isLoading && message?.text.includes('Firebase')}
              leftIcon={<FiDatabase />}
              className="mb-4 w-full"
            >
              Test API Firebase Connection
            </Button>
            
            {testResult && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
        
        {/* Square Connection Test */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiCreditCard className="mr-2 text-blue-500" />
            Square Connection Test
          </h2>
          
          <Button
            variant="outline"
            onClick={testSquareConnection}
            isLoading={isLoading && message?.text.includes('Square')}
            leftIcon={<FiCreditCard />}
            className="mb-4 w-full"
          >
            Test Square Connection
          </Button>
          
          {squareTestResult && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(squareTestResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Google Sheets Connection Test (DEACTIVATED) */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-300 dark:border-gray-600 opacity-60">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiFileText className="mr-2 text-gray-400" />
            Google Sheets (Deactivated)
          </h2>
          
          <Button
            variant="outline"
            onClick={testGoogleSheetsConnection}
            leftIcon={<FiFileText />}
            className="mb-4 w-full"
            disabled={false}
          >
            View Deactivation Status
          </Button>
          
          {sheetsTestResult && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(sheetsTestResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
      
      {/* Sync Products */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiRefreshCw className="mr-2 text-lime-500" />
          Sync Products from Square
        </h2>
        
        <Button
          variant="primary"
          onClick={handleSync}
          isLoading={isLoading && message?.text.includes('Syncing')}
          leftIcon={!isLoading && <FiRefreshCw />}
          className="mb-4 w-full"
        >
          Sync Products from Square
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
      
      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>First test the Firebase and Square connections to ensure they are working properly.</li>
          <li>If both connections are successful, you can proceed with syncing products.</li>
          <li>The sync process will import all products from Square catalog to Firestore.</li>
          <li>Inventory levels will be updated from Square's real-time inventory system.</li>
          <li>Categories will be automatically created based on product categories in Square.</li>
          <li><strong>Note:</strong> Google Sheets integration has been deactivated in favor of Square inventory management.</li>
        </ul>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-2">Troubleshooting</h3>
          <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
            If you're experiencing issues, try these direct test pages:
          </p>
          <div className="flex flex-wrap gap-2">
            <a 
              href="/test/firebase" 
              target="_blank" 
              className="text-sm px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/30"
            >
              Firebase Test
            </a>
            <a 
              href="/admin/square" 
              target="_blank" 
              className="text-sm px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800/30"
            >
              Square Admin
            </a>
            <a 
              href="/test/sync" 
              target="_blank" 
              className="text-sm px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 rounded-md hover:bg-orange-200 dark:hover:bg-orange-800/30"
            >
              Direct Sync Test
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}