'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/lib/context';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FiUser, FiShoppingBag, FiClock, FiEdit, FiLogOut } from 'react-icons/fi';

export default function AccountPage() {
  const { user, loading, logout } = useAppContext();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile function
  const fetchProfile = async () => {
    if (user) {
      try {
        setProfileLoading(true);
        const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setProfileLoading(false);
      }
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !user) {
      router.push('/auth/login');
    }

    if (user) {
      fetchProfile();
    }
  }, [user, loading, router]);

  // Refetch profile when page becomes visible (handles navigation back from profile edit)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-lime-100 dark:bg-lime-900/30 flex items-center justify-center mb-4">
                <FiUser className="w-12 h-12 text-lime-600 dark:text-lime-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user?.email}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {user?.email}
              </p>
            </div>

            <nav className="mt-6">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/account"
                    className="flex items-center p-3 rounded-md bg-lime-50 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300"
                  >
                    <FiUser className="mr-3" />
                    <span>Account Overview</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    className="flex items-center p-3 rounded-md hover:bg-lime-50 dark:hover:bg-lime-900/20 text-gray-700 dark:text-gray-300"
                  >
                    <FiShoppingBag className="mr-3" />
                    <span>My Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/order-history"
                    className="flex items-center p-3 rounded-md hover:bg-lime-50 dark:hover:bg-lime-900/20 text-gray-700 dark:text-gray-300"
                  >
                    <FiClock className="mr-3" />
                    <span>Order History</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/profile"
                    className="flex items-center p-3 rounded-md hover:bg-lime-50 dark:hover:bg-lime-900/20 text-gray-700 dark:text-gray-300"
                  >
                    <FiEdit className="mr-3" />
                    <span>Edit Profile</span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  >
                    <FiLogOut className="mr-3" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            {profile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium">{profile.firstName} {profile.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Company</p>
                  <p className="font-medium">{profile.companyName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                  <p className="font-medium">{profile.phone}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="font-medium">
                    {profile.address}, {profile.city}, {profile.state} {profile.zipCode}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Business Type</p>
                  <p className="font-medium capitalize">{profile.businessType}</p>
                </div>
                
                <div className="pt-4">
                  <Link
                    href="/account/profile"
                    className="inline-flex items-center text-lime-600 dark:text-lime-400 hover:underline"
                  >
                    <FiEdit className="mr-2" />
                    <span>Edit Profile</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Your profile is not complete. Please provide your information to enhance your shopping experience.
                </p>
                <Link
                  href="/account/profile"
                  className="inline-flex items-center px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700"
                >
                  <FiEdit className="mr-2" />
                  <span>Complete Profile</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            
            <div className="py-8 text-center text-gray-600 dark:text-gray-400">
              <FiShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't placed any orders yet.</p>
              <Link
                href="/products"
                className="inline-block mt-4 px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}