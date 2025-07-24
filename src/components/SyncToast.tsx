'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/lib/context';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyncToast() {
  const { syncStatus, isAdmin } = useAppContext();
  const [showToast, setShowToast] = useState(false);
  const [lastSyncCount, setLastSyncCount] = useState(0);

  useEffect(() => {
    // Only show toast for admins
    if (!isAdmin) return;

    // Since auto-sync is disabled, we don't show sync toasts
    if (typeof syncStatus === 'string' || syncStatus === null || !('isRunning' in syncStatus)) return;

    // Show toast when sync completes successfully and count increases
    if (!syncStatus.isRunning && syncStatus.successCount > lastSyncCount && syncStatus.successCount > 0) {
      setShowToast(true);
      setLastSyncCount(syncStatus.successCount);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [syncStatus, lastSyncCount, isAdmin]);

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">
              Products synced successfully
            </span>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 text-white hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}