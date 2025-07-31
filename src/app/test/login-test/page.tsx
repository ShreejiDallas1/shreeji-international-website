'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiCheck, FiX, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import Button from '@/components/Button';
import { useAppContext } from '@/lib/context';

export default function LoginTestPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { login, user } = useAppContext();

  const testLogin = async () => {
    if (!email || !password) {
      setResult({
        success: false,
        message: 'Please enter both email and password'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing login with:', email);
      
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        setResult({
          success: true,
          message: `Successfully logged in! Welcome back.`
        });
      } else {
        setResult({
          success: false,
          message: loginResult.error || 'Login failed'
        });
      }

    } catch (error: any) {
      console.error('❌ Login test error:', error);
      setResult({
        success: false,
        message: 'Network error: Failed to test login'
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
            <FiUser className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Email/Password Login Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test the email/password login functionality with password visibility toggle
            </p>
          </div>

          {user && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center">
                <FiCheck className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-400">
                    Already Logged In
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Email: {user.email}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    UID: {user.uid}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={testLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <FiLoader className="w-5 h-5 mr-2 animate-spin" />
                  Testing Login...
                </>
              ) : (
                <>
                  <FiUser className="w-5 h-5 mr-2" />
                  Test Email/Password Login
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
                      {result.success ? 'Login Successful!' : 'Login Failed'}
                    </p>
                    <p className="text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-400 mb-2">
              🔐 Login System Features
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p>• <strong>Direct Firebase Auth:</strong> Uses signInWithEmailAndPassword</p>
              <p>• <strong>Password Visibility:</strong> Eye icon to show/hide password</p>
              <p>• <strong>Error Handling:</strong> Specific error messages for different failures</p>
              <p>• <strong>Account Linking:</strong> Detects if email is also linked with Google</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-medium text-yellow-900 dark:text-yellow-400 mb-2">
              📝 Test Instructions
            </h3>
            <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
              <p>1. Enter the email you used for Google login</p>
              <p>2. Enter the password you set via password reset</p>
              <p>3. Click the eye icon to toggle password visibility</p>
              <p>4. Click "Test Email/Password Login" to test</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}