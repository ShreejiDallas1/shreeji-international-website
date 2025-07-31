'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiMail, FiAlertCircle, FiCheckCircle, FiArrowLeft, FiClock } from 'react-icons/fi';
import { useAppContext } from '@/lib/context';
import Button from '@/components/Button';
import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';


// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Component that handles the forgot password logic
function ForgotPasswordForm() {
  const router = useRouter();
  const { sendPasswordResetCode } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const watchedEmail = watch('email');

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

  // Check cooldown from localStorage (client-side cooldown)
  useEffect(() => {
    const checkCooldown = () => {
      if (!watchedEmail || !watchedEmail.includes('@')) return;
      
      const cooldownKey = `password-reset-cooldown-${watchedEmail}`;
      const lastSent = localStorage.getItem(cooldownKey);
      
      if (lastSent) {
        const timeDiff = Date.now() - parseInt(lastSent);
        const cooldownPeriod = 30 * 1000; // 30 seconds
        
        if (timeDiff < cooldownPeriod) {
          const remainingSeconds = Math.ceil((cooldownPeriod - timeDiff) / 1000);
          setCooldown(remainingSeconds);
        } else {
          localStorage.removeItem(cooldownKey);
        }
      }
    };

    const timeoutId = setTimeout(checkCooldown, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [watchedEmail]);
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another code`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    console.log('Attempting password reset for email:', data.email);
    
    try {
      const result = await sendPasswordResetCode(data.email);
      console.log('Password reset code result:', result);
      
      if (result.success) {
        setSuccess(true);
        setEmailSent(data.email);
        setCooldown(30); // Start 30-second cooldown
        
        // Set cooldown in localStorage
        const cooldownKey = `password-reset-cooldown-${data.email}`;
        localStorage.setItem(cooldownKey, Date.now().toString());
      } else {
        setError(result.error || 'Failed to send password reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!emailSent) return;
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another email`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await sendPasswordResetCode(emailSent);
      
      if (result.success) {
        setSuccess(true);
        setCooldown(30); // Start 30-second cooldown
        
        // Set cooldown in localStorage
        const cooldownKey = `password-reset-cooldown-${emailSent}`;
        localStorage.setItem(cooldownKey, Date.now().toString());
      } else {
        setError(result.error || 'Failed to resend password reset email. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  
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
              href="/auth/login" 
              className="flex items-center text-gray-400 hover:text-lime-400 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
          
          <h2 className="text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {success 
              ? "We've sent a password reset link to your email"
              : "Enter your email address and we'll send you a secure link to reset your password"
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

        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-900 border-l-4 border-green-500 p-4 mb-4 rounded"
          >
            <div className="flex items-center">
              <FiCheckCircle className="text-green-400 mr-2" />
              <div className="text-sm text-green-200">
                <p className="font-medium">Password reset email sent!</p>
                <p className="mt-1">
                  We've sent a password reset link to <strong>{emailSent}</strong>. 
                  Click the link in your email to reset your password.
                </p>
                <p className="mt-2 text-xs text-green-300">
                  Don't see the email? Check your spam folder or click resend below.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {!success ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  } rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading || cooldown > 0}
                isLoading={isLoading}
              >
                {isLoading ? 'Sending password reset email...' : 
                 cooldown > 0 ? (
                   <>
                     <FiClock className="w-4 h-4 mr-2" />
                     Resend in {cooldown}s
                   </>
                 ) : 'Send password reset email'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleResendEmail}
              disabled={isLoading || cooldown > 0}
              isLoading={isLoading}
            >
              {isLoading ? 'Resending...' : 
               cooldown > 0 ? (
                 <>
                   <FiClock className="w-4 h-4 mr-2" />
                   Resend in {cooldown}s
                 </>
               ) : 'Resend Reset Email'}
            </Button>
            
            <div className="text-center">
              <Link 
                href="/auth/login" 
                className="text-sm text-lime-400 hover:text-lime-300 font-medium"
              >
                Back to login
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Remember your password?{' '}
            <Link href="/auth/login" className="font-medium text-lime-400 hover:text-lime-300">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <h3 className="text-sm font-medium text-gray-200 mb-2">Security Notice</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Reset links expire after 1 hour for security</li>
            <li>• Only the most recent reset link will work</li>
            <li>• If you don't receive an email, check your spam folder</li>
            <li>• Contact support if you continue having issues</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" text="Loading reset form..." />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}