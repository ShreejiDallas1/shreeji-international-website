'use client';

import { useState, useEffect } from 'react';

export default function AdminCleanup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [productsInfo, setProductsInfo] = useState<any>(null);

  // Check products on load
  useEffect(() => {
    checkProducts();
  }, []);

  const checkProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProductsInfo(data);
    } catch (error) {
      console.error('Error checking products:', error);
    }
  };

  const deleteAllOrders = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/cleanup', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Successfully deleted ${data.deletedCount} orders`);
        // Refresh the page after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin';
        }, 2000);
      } else {
        setMessage(`❌ Failed to delete orders: ${data.error}`);
      }
      
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/square/sync-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: 'shreeji_sync_api_2024'
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage(`✅ Successfully synced ${data.syncedCount} products and ${data.categoriesSynced} categories from Square!`);
        // Refresh products info
        setTimeout(() => {
          checkProducts();
        }, 1000);
      } else {
        setMessage(`❌ Failed to sync products: ${data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      setMessage(`❌ Error syncing products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">🚨 EMERGENCY FIXES</h1>
          
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Warning</h2>
              <p className="text-yellow-700">
                This page is for cleaning up test orders. Use with caution as deletions cannot be undone.
              </p>
            </div>
            
            {/* Products Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">📦 Products Status</h2>
              {productsInfo ? (
                <div className="text-blue-700">
                  <p>Products in database: <strong>{productsInfo.count || 0}</strong></p>
                  {productsInfo.count === 0 && (
                    <p className="text-red-600 mt-2">⚠️ No products found! This is why the products page is empty.</p>
                  )}
                </div>
              ) : (
                <p className="text-blue-700">Loading products info...</p>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={syncProducts}
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : '📦 SYNC PRODUCTS FROM SQUARE (Fix Products Issue)'}
              </button>
              
              <button
                onClick={deleteAllOrders}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : '🗑️ DELETE ALL ORDERS (Fix Admin Issue)'}
              </button>
              
              <button
                onClick={checkProducts}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : '🔄 Refresh Products Status'}
              </button>
            </div>
            
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
                message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <p className="whitespace-pre-wrap">{message}</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <a
                href="/admin"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                ← Back to Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}