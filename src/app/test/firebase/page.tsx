'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [resetResult, setResetResult] = useState<string>('');

  // Check if Firebase is initialized
  useEffect(() => {
    try {
      if (db) {
        setInitialized(true);
        console.log("Firebase initialized successfully");
      } else {
        setError("Firebase db object is undefined");
      }
    } catch (err: any) {
      setError(`Firebase initialization error: ${err.message}`);
      console.error("Firebase initialization error:", err);
    }
  }, []);

  const testFirebase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test write operation with a direct document ID
      const testDoc = doc(db, 'test', 'test-' + Date.now());
      await setDoc(testDoc, {
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
        writeDocId: testDoc.id,
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
        code: err.code,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testPasswordReset = async () => {
    if (!testEmail) {
      setResetResult('Please enter an email');
      return;
    }

    setLoading(true);
    setResetResult('');

    try {
      console.log('Testing Firebase password reset for:', testEmail);
      console.log('Auth object:', auth);
      console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);

      await sendPasswordResetEmail(auth, testEmail, {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
        handleCodeInApp: false
      });

      setResetResult('✅ SUCCESS: Password reset email sent successfully!');
    } catch (error: any) {
      console.error('Firebase password reset test error:', error);
      setResetResult(`❌ ERROR: ${error.code} - ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Firebase Test Page</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Firebase Initialization Status</h2>
        
        {initialized ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            Firebase is initialized successfully.
          </div>
        ) : (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            Firebase is not initialized. Error: {error || "Unknown error"}
          </div>
        )}
        
        <div className="mt-6">
          <button
            onClick={testFirebase}
            disabled={loading || !initialized}
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
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Password Reset Test</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Email:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter email to test password reset"
            />
          </div>

          <button
            onClick={testPasswordReset}
            disabled={loading || !initialized}
            className="px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Password Reset'}
          </button>

          {resetResult && (
            <div className={`p-4 rounded-md ${
              resetResult.includes('SUCCESS') 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              <pre className="text-sm whitespace-pre-wrap">{resetResult}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Firebase Configuration</h2>
        <pre className="text-xs overflow-auto max-h-60 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
{`{
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "shreeji-international.firebaseapp.com",
  projectId: "shreeji-international",
  storageBucket: "shreeji-international.appspot.com",
  messagingSenderId: "310139617669",
  appId: "1:310139617669:web:541ebb6debb186327e44ec",
  measurementId: "G-J5LKGJ3QQC"
}`}
        </pre>
      </div>
    </div>
  );
}