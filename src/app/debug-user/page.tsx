'use client';

import { useAppContext } from '@/lib/context';
import { useAdmin } from '@/hooks/useAdmin';

export default function DebugUserPage() {
  const { user } = useAppContext();
  const { isAdmin, loading } = useAdmin();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Debug Information</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div>
          <strong>User Object:</strong>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'null'}
          </pre>
        </div>
        
        <div>
          <strong>User Email:</strong> {user?.email || 'No email'}
        </div>
        
        <div>
          <strong>Is Admin:</strong> {isAdmin ? 'YES' : 'NO'}
        </div>
        
        <div>
          <strong>Admin Loading:</strong> {loading ? 'YES' : 'NO'}
        </div>
        
        <div>
          <strong>Expected Admin Email:</strong> shreejidallas1@gmail.com
        </div>
        
        <div>
          <strong>Email Match:</strong> {user?.email === 'shreejidallas1@gmail.com' ? 'YES' : 'NO'}
        </div>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-gray-600">
          If you're logged in with shreejidallas1@gmail.com and "Is Admin" shows NO, 
          there might be an issue with the authentication state.
        </p>
      </div>
    </div>
  );
}