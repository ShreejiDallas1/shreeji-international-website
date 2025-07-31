'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiX, FiLoader, FiClock, FiEye } from 'react-icons/fi';
import Button from '@/components/Button';

export default function VerificationCodeTestPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [step, setStep] = useState<'send' | 'verify'>('send');
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

  const sendCode = async () => {
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
      const response = await fetch('/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setCooldown(30);
        setStep('verify');
        setResult({
          success: true,
          message: `Verification code sent to ${email}! Check your email and console for the code.`,
          messageId: data.messageId
        });
      } else {
        if (data.remainingCooldown) {
          setCooldown(data.remainingCooldown);
        }
        setResult({
          success: false,
          message: data.error || 'Failed to send verification code'
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

  const verifyCode = async () => {
    if (!code) {
      setResult({
        success: false,
        message: 'Please enter the verification code'
      });
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();
      
      setResult({
        success: data.success,
        message: data.success 
          ? 'Verification code is valid! You can now reset your password.'
          : data.error || 'Invalid verification code'
      });

    } catch (error) {
      setResult({
        success: false,
        message: 'Network error: Failed to verify code'
      });
    } finally {
      setVerifying(false);
    }
  };

  const resetFlow = () => {
    setStep('send');
    setCode('');
    setResult(null);
    setCooldown(0);
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
              Verification Code System Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test the complete verification code flow with 8-digit codes
            </p>
          </div>

          <div className="space-y-6">
            {step === 'send' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email to receive verification code"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <Button
                  onClick={sendCode}
                  disabled={loading || cooldown > 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                      Sending Verification Code...
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <FiClock className="w-5 h-5 mr-2" />
                      Resend in {cooldown}s
                    </>
                  ) : (
                    <>
                      <FiMail className="w-5 h-5 mr-2" />
                      Send 8-Digit Verification Code
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    8-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Enter 8-digit code from email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center text-2xl font-mono tracking-widest"
                    maxLength={8}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Sent to: {email}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={verifyCode}
                    disabled={verifying || code.length !== 8}
                    className="flex-1"
                  >
                    {verifying ? (
                      <>
                        <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5 mr-2" />
                        Verify Code
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={resetFlow}
                    variant="outline"
                    className="flex-1"
                  >
                    Send New Code
                  </Button>
                </div>
              </>
            )}

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
                    {result.messageId && (
                      <p className="text-xs mt-1 opacity-75">Message ID: {result.messageId}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2 flex items-center">
              <FiEye className="w-4 h-4 mr-2" />
              How It Works
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• <strong>Step 1:</strong> Enter email → 8-digit code generated & sent</p>
              <p>• <strong>Step 2:</strong> Check email for verification code</p>
              <p>• <strong>Step 3:</strong> Enter code → System verifies & allows password reset</p>
              <p>• <strong>Cooldown:</strong> 30-second wait between requests</p>
              <p>• <strong>Development:</strong> Codes are logged to browser console</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">
              📧 Email Status
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <p>• <strong>Current Mode:</strong> Development (codes logged to console)</p>
              <p>• <strong>For Real Emails:</strong> Add Resend API key to .env.local</p>
              <p>• <strong>Check Console:</strong> Open browser dev tools to see the verification code</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}