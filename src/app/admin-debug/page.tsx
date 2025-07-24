'use client';

import { useAppContext } from '@/lib/context';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDebugPage() {
  const { user: contextUser, loading: contextLoading } = useAppContext();
  const { user: authUser, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Admin Debug Information</h1>
      
      <div className="grid gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Context User</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {contextLoading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {contextUser ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Email:</strong> {contextUser?.email || 'None'}</p>
            <p><strong>Display Name:</strong> {contextUser?.displayName || 'None'}</p>
            <p><strong>UID:</strong> {contextUser?.uid || 'None'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Auth User</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {authUser ? 'Logged in' : 'Not logged in'}</p>
            <p><strong>Email:</strong> {authUser?.email || 'None'}</p>
            <p><strong>Display Name:</strong> {authUser?.displayName || 'None'}</p>
            <p><strong>UID:</strong> {authUser?.uid || 'None'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admin Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {adminLoading ? 'Yes' : 'No'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Admin Emails Configuration</h2>
          <div className="space-y-2">
            <p><strong>Configured Admin Emails:</strong></p>
            <ul className="list-disc pl-6">
              <li>shreejidallas1@gmail.com</li>
              <li>admin@shreejiinternational.com</li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Raw User Object</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(contextUser, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}