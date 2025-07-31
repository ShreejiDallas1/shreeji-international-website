'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiArrowLeft, FiAlertCircle, FiCheckCircle, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import Button from '@/components/Button';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

// Form validation schema
const verifyResetCodeSchema = z.object({
  code: z.string()
    .min(8, 'Verification code must be 8 digits')
    .max(8, 'Verification code must be 8 digits')
    .regex(/^\d{8}$/, 'Verification code must contain only numbers'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 
      'Password must contain uppercase, lowercase, number, and special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VerifyResetCodeFormData = z.infer<typeof verifyResetCodeSchema>;

// Component that handles the verification logic
function VerifyResetCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { verifyResetCode, resetPasswordWithCode } = useAppContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'verify' | 'reset'>('verify');

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<VerifyResetCodeFormData>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  const watchedPassword = watch('newPassword', '');

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push('/auth/forgot-password');
    }
  }, [email, router]);

  const onSubmitVerification = async (data: VerifyResetCodeFormData) => {
    setIsLoading(true);
    setError(null);
    
    console.log('Verifying code for email:', email);
    
    try {
      if (step === 'verify') {
        // First verify the code
        const result = await verifyResetCode(email, data.code);
        console.log('Code verification result:', result);
        
        if (result.success) {
          setStep('reset');
        } else {
          setError(result.error || 'Invalid verification code. Please try again.');
        }
      } else {
        // Reset the password
        const result = await resetPasswordWithCode(email, data.code, data.newPassword);
        console.log('Password reset result:', result);
        
        if (result.success) {
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login?message=password-reset-success');
          }, 3000);
        } else {
          setError(result.error || 'Failed to reset password. Please try again.');
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return <LoadingSpinner />;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-900 mb-4"
            >
              <FiCheckCircle className="h-6 w-6 text-green-400" />
            </motion.div>
            
            <h2 className="text-3xl font-extrabold text-white mb-2">
              Password Reset Successful!
            </h2>
            <p className="text-gray-300 mb-6">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            
            <Button
              onClick={() => router.push('/auth/login')}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Continue to Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700"
      >
        <div>
          <div className="flex items-center mb-6">
            <Link 
              href="/auth/forgot-password" 
              className="flex items-center text-gray-400 hover:text-lime-400 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </Link>
          </div>
          
          <h2 className="text-center text-3xl font-extrabold text-white">
            {step === 'verify' ? 'Enter Verification Code' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {step === 'verify' 
              ? `Enter the 8-digit code sent to ${email}`
              : 'Choose a strong new password for your account'
            }
          </p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900 border-l-4 border-red-500 p-4 mb-4 rounded"
          >
            <div className="flex items-center">
              <FiAlertCircle className="text-red-400 mr-2" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </motion.div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmitVerification)}>
          {/* Verification Code Input */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-1">
              8-Digit Verification Code
            </label>
            <input
              id="code"
              type="text"
              maxLength={8}
              {...register('code')}
              className={`appearance-none block w-full px-3 py-2 border ${
                errors.code ? 'border-red-500' : 'border-gray-600'
              } rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent text-center text-lg tracking-widest`}
              placeholder="12345678"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-400">{errors.code.message}</p>
            )}
          </div>

          {/* Password Fields - Only show in reset step */}
          {step === 'reset' && (
            <>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-600'
                    } rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
                )}
                
                {/* Password Strength Indicator */}
                {watchedPassword && (
                  <div className="mt-2">
                    <PasswordStrengthIndicator password={watchedPassword} />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    } rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading 
                ? (step === 'verify' ? 'Verifying...' : 'Resetting Password...') 
                : (step === 'verify' ? 'Verify Code' : 'Reset Password')
              }
            </Button>
          </div>
        </form>

        {/* Development Helper */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-900 text-blue-200 rounded-md border border-blue-500">
            <h4 className="font-medium mb-2">🔧 Development Helper:</h4>
            <p className="text-sm">
              Check the browser console or localStorage for the verification code.
            </p>
            <button
              type="button"
              onClick={() => {
                const devCode = localStorage.getItem('dev_verification_code');
                if (devCode) {
                  setValue('code', devCode);
                }
              }}
              className="mt-2 text-xs bg-blue-800 hover:bg-blue-700 px-2 py-1 rounded"
            >
              Auto-fill Code
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Didn't receive the code?{' '}
            <Link href="/auth/forgot-password" className="font-medium text-lime-400 hover:text-lime-300">
              Request a new one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function VerifyResetCodePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VerifyResetCodeForm />
    </Suspense>
  );
}