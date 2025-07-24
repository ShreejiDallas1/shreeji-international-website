'use client';

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useAdmin } from '@/hooks/useAdmin';
import { useAppContext } from '@/lib/context';

export default function AutoSync() {
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [lastAutoSync, setLastAutoSync] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, triggerProductsRefresh } = useAppContext();

  // AUTO-SYNC DISABLED - Causing page refresh issues and making website unusable
  // Manual sync only through admin dashboard
  useEffect(() => {
    console.log('🚫 Auto-sync disabled to prevent page refresh issues');
    // No automatic syncing - only manual sync allowed
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <FiRefreshCw className="h-4 w-4 animate-spin text-lime-600" />;
      case 'success':
        return <FiCheck className="h-4 w-4 text-lime-600" />;
      case 'error':
        return <FiAlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FiRefreshCw className="h-4 w-4 text-lime-500" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Updating products...';
      case 'success':
        return 'Products updated';
      case 'error':
        return 'Update failed';
      default:
        if (isAdmin) return 'Auto-sync enabled';
        return 'Live updates active';
    }
  };

  // Auto-sync component disabled - return null to prevent any UI rendering
  return null;
}