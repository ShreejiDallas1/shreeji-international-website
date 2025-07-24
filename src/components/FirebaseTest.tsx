'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFirebase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test write operation
      const testCollection = collection(db, 'test');
      const docRef = await addDoc(testCollection, {
        message: 'Test document',
        timestamp: new Date().toISOString()
      });
      
      // Test read operation
      const q = query(collection(db, 'test'), limit(5));
      const querySnapshot = await getDocs(q);
      
      const documents: any[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setTestResult({
        writeSuccess: true,
        writeDocId: docRef.id,
        readSuccess: true,
        documents
      });
    } catch (err: any) {
      console.error('Firebase test error:', err);
      setError(err.message || 'Unknown error');
      setTestResult({
        writeSuccess: false,
        readSuccess: false,
        error: err.message,
        code: err.code
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Firebase Connection Test</h2>
      
      <button
        onClick={testFirebase}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Firebase Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
          <p className="font-semibold mb-2">Test Results:</p>
          <pre className="text-xs overflow-auto max-h-60">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}