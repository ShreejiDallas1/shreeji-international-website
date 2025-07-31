'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

interface SecurityNotificationProps {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose?: () => void;
  showIcon?: boolean;
  persistent?: boolean;
}

export default function SecurityNotification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  showIcon = true,
  persistent = false
}: SecurityNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="w-5 h-5" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'error':
        return <FiAlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <FiShield className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/90',
          border: 'border-green-500/50',
          icon: 'text-green-400',
          title: 'text-green-100',
          message: 'text-green-200'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/90',
          border: 'border-yellow-500/50',
          icon: 'text-yellow-400',
          title: 'text-yellow-100',
          message: 'text-yellow-200'
        };
      case 'error':
        return {
          bg: 'bg-red-900/90',
          border: 'border-red-500/50',
          icon: 'text-red-400',
          title: 'text-red-100',
          message: 'text-red-200'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/90',
          border: 'border-blue-500/50',
          icon: 'text-blue-400',
          title: 'text-blue-100',
          message: 'text-blue-200'
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-4 right-4 z-50 max-w-md w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg backdrop-blur-sm`}
        >
          <div className="p-4">
            <div className="flex items-start space-x-3">
              {showIcon && (
                <div className={`flex-shrink-0 ${colors.icon}`}>
                  {getIcon()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-medium ${colors.title}`}>
                  {title}
                </h3>
                <p className={`mt-1 text-sm ${colors.message}`}>
                  {message}
                </p>
              </div>
              
              <button
                onClick={handleClose}
                className={`flex-shrink-0 ${colors.icon} hover:opacity-75 transition-opacity`}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Progress bar for timed notifications */}
          {!persistent && duration > 0 && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`h-1 ${colors.border.replace('border-', 'bg-').replace('/50', '/30')} rounded-b-lg`}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing security notifications
export function useSecurityNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
  }>>([]);

  const addNotification = (notification: Omit<typeof notifications[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Security-specific notification helpers
  const notifySecurityEvent = {
    loginSuccess: () => addNotification({
      type: 'success',
      title: 'Login Successful',
      message: 'You have been securely logged in to your account.',
      duration: 3000
    }),
    
    loginFailed: (attempts: number) => addNotification({
      type: 'error',
      title: 'Login Failed',
      message: `Invalid credentials. ${5 - attempts} attempts remaining before account lockout.`,
      duration: 5000
    }),
    
    accountLocked: () => addNotification({
      type: 'error',
      title: 'Account Temporarily Locked',
      message: 'Too many failed login attempts. Please try again in 15 minutes.',
      duration: 8000,
      persistent: true
    }),
    
    passwordResetSent: (email: string) => addNotification({
      type: 'info',
      title: 'Password Reset Email Sent',
      message: `A password reset link has been sent to ${email}. Check your inbox and spam folder.`,
      duration: 6000
    }),
    
    passwordResetSuccess: () => addNotification({
      type: 'success',
      title: 'Password Reset Successful',
      message: 'Your password has been successfully updated. You can now log in with your new password.',
      duration: 5000
    }),
    
    weakPassword: () => addNotification({
      type: 'warning',
      title: 'Weak Password Detected',
      message: 'Please choose a stronger password that meets all security requirements.',
      duration: 4000
    }),
    
    securityAlert: (message: string) => addNotification({
      type: 'warning',
      title: 'Security Alert',
      message,
      duration: 7000,
      persistent: true
    }),
    
    sessionExpired: () => addNotification({
      type: 'warning',
      title: 'Session Expired',
      message: 'Your session has expired for security reasons. Please log in again.',
      duration: 6000
    })
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifySecurityEvent
  };
}

// Security Notifications Container Component
export function SecurityNotificationsContainer() {
  const { notifications, removeNotification } = useSecurityNotifications();

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {notifications.map((notification) => (
        <SecurityNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          persistent={notification.persistent}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}