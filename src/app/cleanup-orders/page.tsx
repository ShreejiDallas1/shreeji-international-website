'use client';

import { useState } from 'react';
import { FiTrash2, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

export default function CleanupOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cleanup-orders');
      const data = await response.json();
      setOrders(data.orders || []);
      setResult(`Found ${data.totalOrders} orders`);
    } catch (error) {
      setResult('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrders = async () => {
    if (!confirm('Are you sure you want to delete ALL orders? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cleanup-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });
      
      const data = await response.json();
      if (data.success) {
        setResult(`✅ ${data.message}`);
        setOrders([]);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Error cleaning up orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <FiAlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
            <h1 className="text-2xl font-bold text-white">Order Cleanup Utility</h1>
          </div>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <button
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FiRefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Fetch Orders
              </button>

              <button
                onClick={cleanupOrders}
                disabled={loading || orders.length === 0}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Delete All Orders
              </button>
            </div>

            {result && (
              <div className="p-4 bg-gray-700 rounded-md">
                <pre className="text-green-400 text-sm">{result}</pre>
              </div>
            )}

            {orders.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Found Orders:</h2>
                <div className="bg-gray-700 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-200">Order ID</th>
                        <th className="px-4 py-2 text-left text-gray-200">Status</th>
                        <th className="px-4 py-2 text-left text-gray-200">Total</th>
                        <th className="px-4 py-2 text-left text-gray-200">Created</th>
                        <th className="px-4 py-2 text-left text-gray-200">User ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <tr key={order.id} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                          <td className="px-4 py-2 text-gray-300">{order.id}</td>
                          <td className="px-4 py-2 text-gray-300">{order.status}</td>
                          <td className="px-4 py-2 text-gray-300">${order.total}</td>
                          <td className="px-4 py-2 text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2 text-gray-300 text-xs">{order.userId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-yellow-900 border border-yellow-600 rounded-md">
            <p className="text-yellow-200 text-sm">
              <strong>Warning:</strong> This utility will permanently delete all orders from the database. 
              Use with caution! Make sure you've created the Firebase index first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}