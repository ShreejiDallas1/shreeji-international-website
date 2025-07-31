'use client';

import { useState, useEffect } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';


export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (result.user.email) {
        const signInMethods = await fetchSignInMethodsForEmail(auth, result.user.email);
        if (signInMethods.includes('password')) {
          console.log('Google account linked with existing email/password account');
        }
      }
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting to sign in with email/password:', email);
      
      // Use Firebase signInWithEmailAndPassword directly
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Successfully signed in with email/password:', user.email);
      
      // Check if this account can be linked with Google
      try {
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        if (signInMethods.includes('google.com')) {
          console.log('💡 This email is also linked with Google account');
        }
      } catch (linkCheckError) {
        console.log('Could not check account linking options:', linkCheckError);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('❌ Email/password sign in failed:', error);
      
      let errorMessage = 'Failed to sign in';
      
      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      // Use secure registration with password validation
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      
      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to register'
        };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const sendPasswordResetCode = async (email: string) => {
    try {
      console.log('📧 Sending Firebase password reset email to:', email);
      
      // Use Firebase's built-in password reset email
      await sendPasswordResetEmail(auth, email, {
        // Custom action code settings for better styling
        url: `${window.location.origin}/auth/login`, // Redirect back to login after reset
        handleCodeInApp: false // Use Firebase's hosted page (looks professional)
      });
      
      console.log('✅ Firebase password reset email sent successfully!');
      
      return {
        success: true,
        message: 'Password reset email sent successfully!'
      };
    } catch (error: any) {
      console.error('❌ Firebase password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
      });
      const result = await response.json();
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid or expired reset code';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword })
      });
      const result = await response.json();
      return result;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    login,
    register,
    logout,
    sendPasswordResetCode,
    verifyResetCode,
    resetPasswordWithCode,
  };
}
