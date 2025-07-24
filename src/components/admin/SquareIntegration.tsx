'use client';

import { useState } from 'react';
import { FiRefreshCw, FiCheckCircle, FiAlertCircle, FiSettings, FiPackage } from 'react-icons/fi';

interface SquareIntegrationProps {
  isAdmin: boolean;
}

interface SyncStatus {
  isRunning: boolean;
  lastSync: string | null;
  success: boolean;
  synced: number;
  errors: number;
  message: string;
}

export default function SquareIntegration({ isAdmin }: SquareIntegrationProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    lastSync: null,
    success: false,
    synced: 0,
    errors: 0,
    message: ''
  });

  const [locations, setLocations] = useState<any[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleSync = async () => {
    setSyncStatus(prev => ({ ...prev, isRunning: true, message: 'Starting sync...' }));

    try {
      const response = await fetch('/api/square/inventory?sync=true', {
        method: 'GET',
      });

      const result = await response.json();
      
      setSyncStatus({
        isRunning: false,
        lastSync: new Date().toISOString(),
        success: result.success,
        synced: result.synced || 0,
        errors: result.errors || 0,
        message: result.success ? 'Sync completed successfully!' : 'Sync completed with errors'
      });

    } catch (error) {
      setSyncStatus({
        isRunning: false,
        lastSync: new Date().toISOString(),
        success: false,
        synced: 0,
        errors: 1,
        message: 'Sync failed: ' + (error as Error).message
      });
    }
  };

  const handleLoadLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch('/api/square/locations');
      const result = await response.json();
      
      if (result.success) {
        setLocations(result.locations);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoadingLocations(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiSettings className="text-2xl text-blue-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">Square Integration</h2>
            <p className="text-sm text-gray-600">Manage Square catalog and inventory sync</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {syncStatus.lastSync && (
            <span className="text-xs text-gray-500">
              Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          )}
          
          {syncStatus.success && (
            <FiCheckCircle className="text-green-500" />
          )}
          
          {syncStatus.errors > 0 && (
            <FiAlertCircle className="text-red-500" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Controls */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FiRefreshCw className="mr-2" />
            Catalog Sync
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleSync}
              disabled={syncStatus.isRunning}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                syncStatus.isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {syncStatus.isRunning ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </span>
              ) : (
                'Sync from Square'
              )}
            </button>
            
            {syncStatus.message && (
              <div className={`p-3 rounded-md text-sm ${
                syncStatus.success 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {syncStatus.message}
                {syncStatus.synced > 0 && (
                  <div className="mt-1 text-xs">
                    ✅ {syncStatus.synced} products synced
                    {syncStatus.errors > 0 && ` • ❌ ${syncStatus.errors} errors`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Locations */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <FiPackage className="mr-2" />
            Square Locations
          </h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLoadLocations}
              disabled={loadingLocations}
              className="w-full px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {loadingLocations ? 'Loading...' : 'Load Locations'}
            </button>
            
            {locations.length > 0 && (
              <div className="space-y-2">
                {locations.map((location, index) => (
                  <div
                    key={location.id || index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
                  >
                    <div>
                      <div className="font-medium">{location.name}</div>
                      {location.businessName && (
                        <div className="text-gray-600">{location.businessName}</div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      location.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {location.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">Square Integration Status</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>✅ Payment processing: Active</div>
          <div>✅ Catalog sync: Available</div>
          <div>✅ Inventory tracking: Enabled</div>
          <div>⚠️ UPS shipping: Pending API setup</div>
        </div>
      </div>
    </div>
  );
}