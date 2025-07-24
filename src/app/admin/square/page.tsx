'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/lib/context';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

export default function SquareAdminPage() {
  const { user } = useAppContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin (you can implement proper admin check)
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    fetchSyncStatus();
    fetchConfig();
  }, [user, router]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/square/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/square/sync-products');
      const data = await response.json();
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const fetchSquareProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/square/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
        setCategories(data.categories);
      } else {
        alert('Error fetching Square products: ' + data.error);
      }
    } catch (error) {
      console.error('Error fetching Square products:', error);
      alert('Error fetching Square products');
    } finally {
      setLoading(false);
    }
  };

  const syncFromSquare = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/square/sync-products', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully synced ${data.productsCount} products and ${data.categoriesCount} categories from Square!`);
        fetchSyncStatus();
      } else {
        alert('Error syncing from Square: ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing from Square:', error);
      alert('Error syncing from Square');
    } finally {
      setLoading(false);
    }
  };

  // Google Sheets sync removed - only Square sync available

  const createSampleProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/square/create-sample-products', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully created sample products! ${data.message}`);
        fetchSyncStatus();
        fetchSquareProducts();
      } else {
        alert('Error creating sample products: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating sample products:', error);
      alert('Error creating sample products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Square Integration Admin</h1>
          
          {/* Configuration Status */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Configuration Status</h2>
            
            {config ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Environment:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    config.config.environment === 'production' 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-yellow-900 text-yellow-200'
                  }`}>
                    {config.config.environment.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Application ID:</span>
                  <span className={`text-sm ${config.config.hasApplicationId ? 'text-green-400' : 'text-red-400'}`}>
                    {config.config.hasApplicationId ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Access Token:</span>
                  <span className={`text-sm ${config.config.hasAccessToken ? 'text-green-400' : 'text-red-400'}`}>
                    {config.config.hasAccessToken ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Location ID:</span>
                  <span className={`text-sm ${config.config.hasLocationId ? 'text-green-400' : 'text-red-400'}`}>
                    {config.config.hasLocationId ? '✅ Configured' : '❌ Missing'}
                  </span>
                </div>
                <div className="mt-4 p-3 rounded bg-gray-700">
                  <p className={`text-sm ${config.isConfigured ? 'text-green-400' : 'text-red-400'}`}>
                    {config.message}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Loading configuration...</p>
            )}
          </div>
          
          {/* Sync Status */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Sync Status</h2>
            
            {syncStatus ? (
              <div className="space-y-2 text-gray-300">
                <p>Firestore Products: <span className="text-lime-400">{syncStatus.firestoreProductsCount}</span></p>
                <p>Square Synced Products: <span className="text-lime-400">{syncStatus.squareSyncedProductsCount}</span></p>
                {syncStatus.lastSyncedProducts?.length > 0 && (
                  <div>
                    <p className="text-white mt-4 mb-2">Recently Synced:</p>
                    <ul className="text-sm space-y-1">
                      {syncStatus.lastSyncedProducts.map((product: any) => (
                        <li key={product.id} className="text-gray-400">
                          {product.name} - {product.lastSyncedAt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Loading sync status...</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={fetchSquareProducts}
                disabled={loading}
                variant="outline"
              >
                {loading ? 'Loading...' : 'Fetch Square Products'}
              </Button>
              
              <Button
                onClick={syncFromSquare}
                disabled={loading}
                variant="primary"
              >
                {loading ? 'Syncing...' : 'Sync from Square Catalog'}
              </Button>
              
              <Button
                onClick={createSampleProducts}
                disabled={loading}
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Sample Products'}
              </Button>
              
              <div className="bg-gray-700 p-3 rounded border border-gray-600">
                <p className="text-sm text-gray-400 text-center">
                  🚫 Google Sheets sync permanently disabled<br />
                  Use Square sync only
                </p>
              </div>
              
              <Button
                onClick={fetchSyncStatus}
                disabled={loading}
                variant="outline"
              >
                Refresh Status
              </Button>
            </div>
          </div>

          {/* Square Products */}
          {products.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Square Products ({products.length})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Category</th>
                      <th className="text-left py-2">SKU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 10).map((product) => (
                      <tr key={product.id} className="border-b border-gray-700">
                        <td className="py-2">{product.name}</td>
                        <td className="py-2">${product.price?.toFixed(2) || '0.00'}</td>
                        <td className="py-2">{product.category}</td>
                        <td className="py-2 text-xs">{product.sku}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length > 10 && (
                  <p className="text-gray-400 text-center mt-4">
                    Showing first 10 products out of {products.length}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mt-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                Square Categories ({categories.length})
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <div key={category.id} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-white font-medium">{category.name}</p>
                    <p className="text-xs text-gray-400">{category.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}