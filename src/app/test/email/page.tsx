'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiX, FiLoader, FiClock } from 'react-icons/fi';
import Button from '@/components/Button';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [forceReal, setForceReal] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    messageId?: string;
  } | null>(null);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldown]);

  // Check cooldown when email changes
  useEffect(() => {
    const checkCooldown = async () => {
      if (!email) return;
      
      try {
        const response = await fetch('/api/check-cooldown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        if (data.success && data.inCooldown) {
          setCooldown(data.remainingSeconds);
        }
      } catch (error) {
        console.error('Error checking cooldown:', error);
      }
    };

    const timeoutId = setTimeout(checkCooldown, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [email]);

  const testEmail = async () => {
    if (!email) {
      setResult({
        success: false,
        message: 'Please enter an email address'
      });
      return;
    }

    if (cooldown > 0) {
      setResult({
        success: false,
        message: `Please wait ${cooldown} seconds before sending another code`
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Choose API endpoint based on force real email setting
      const apiEndpoint = forceReal ? '/api/force-send-email' : '/api/test-email-direct';
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          useRealEmail: forceReal 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Start 30-second cooldown
        setCooldown(30);
        setResult({
          success: true,
          message: `Email sent successfully! ${data.testCode ? `Test Code: ${data.testCode}` : ''} ${data.messageId ? `Message ID: ${data.messageId}` : ''}`,
          messageId: data.messageId
        });
      } else {
        // Check if it's a cooldown error
        if (data.remainingCooldown) {
          setCooldown(data.remainingCooldown);
        }
        setResult({
          success: false,
          message: data.error || 'Failed to send email'
        });
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Network error: Failed to send request'
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
              Email Service Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test the email verification system
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

            <div className="flex items-center">
              <input
                type="checkbox"
                id="forceReal"
                checked={forceReal}
                onChange={(e) => setForceReal(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="forceReal" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                🚀 Force send real email (requires Gmail credentials in .env.local)
              </label>
            </div>

            <Button
              onClick={testEmail}
              disabled={loading || cooldown > 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                  Sending Test Email...
                </>
              ) : cooldown > 0 ? (
                <>
                  <FiClock className="w-5 h-5 mr-2" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <FiMail className="w-5 h-5 mr-2" />
                  Send Test Email
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
              📧 Email Configuration Status
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• <strong>Development Mode:</strong> Emails logged to console</p>
              <p>• <strong>Production Mode:</strong> Requires Gmail SMTP credentials</p>
              <p>• Check the browser console for development mode output</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}