'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      setAdminLoading(true);
      
      // Admin emails (add more as needed)
      const adminEmails = [
        'shreejidallas1@gmail.com',
        
        
      ];
      
      console.log('🔍 useAdmin - Auth loading:', loading);
      console.log('🔍 useAdmin - User:', user);
      console.log('🔍 useAdmin - User email:', user?.email);
      console.log('🔍 useAdmin - Admin emails:', adminEmails);
      
      if (user && user.email) {
        const userEmail = user.email.toLowerCase();
        console.log('🔍 useAdmin - Normalized user email:', userEmail);
        console.log('🔍 useAdmin - Is email in admin list?', adminEmails.includes(userEmail));
        
        if (adminEmails.includes(userEmail)) {
          console.log('✅ useAdmin - User is admin:', user.email);
          setIsAdmin(true);
        } else {
          console.log('❌ useAdmin - User is not admin:', user?.email);
          setIsAdmin(false);
        }
      } else {
        console.log('❌ useAdmin - No user or email:', user?.email);
        setIsAdmin(false);
      }
      
      setAdminLoading(false);
    };

    if (!loading) {
      console.log('🔍 useAdmin - Auth finished loading, checking admin status');
      checkAdminStatus();
    } else {
      console.log('⏳ useAdmin - Auth still loading...');
    }
  }, [user, loading]);

  return {
    isAdmin,
    loading: loading || adminLoading,
  };
}
