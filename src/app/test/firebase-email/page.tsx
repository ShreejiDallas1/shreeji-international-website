'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import Button from '@/components/Button';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function FirebaseEmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const testFirebaseEmail = async () => {
    if (!email) {
      setResult({
        success: false,
        message: 'Please enter an email address'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🔥 Testing Firebase password reset email...');
      
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/auth/login`,
        handleCodeInApp: false
      });
      
      console.log('✅ Firebase email sent successfully!');
      
      setResult({
        success: true,
        message: `Firebase password reset email sent to ${email}! Check your inbox for a link to reset your password.`
      });

    } catch (error: any) {
      console.error('❌ Firebase email error:', error);
      
      let errorMessage = 'Failed to send email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      setResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <FiMail className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Firebase Password Reset Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test Firebase's built-in password reset system (sends link to reset password)
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to test"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <Button
              onClick={testFirebaseEmail}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                  Sending Firebase Email...
                </>
              ) : (
                <>
                  <FiMail className="w-5 h-5 mr-2" />
                  Send Firebase Reset Email
                </>
              )}
            </Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}
              >
                <div className="flex items-start">
                  {result.success ? (
                    <FiCheck className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <FiX className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {result.success ? 'Success!' : 'Error'}
                    </p>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
              🔥 Firebase Email System
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• <strong>Reliable:</strong> Uses Firebase's email infrastructure</p>
              <p>• <strong>Professional:</strong> Firebase-hosted reset page with your branding</p>
              <p>• <strong>Secure:</strong> Built-in rate limiting and security</p>
              <p>• <strong>No Setup:</strong> Works immediately, no SMTP configuration needed</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}