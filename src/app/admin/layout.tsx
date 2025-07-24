'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import Link from 'next/link';
import { FiDatabase, FiUsers, FiPackage, FiSettings, FiHome, FiImage } from 'react-icons/fi';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not admin
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiHome className="mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/products" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiPackage className="mr-3" />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/sync" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiDatabase className="mr-3" />
                <span>Sync Data</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/images" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiImage className="mr-3" />
                <span>Product Images</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/users" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiUsers className="mr-3" />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/settings" 
                className="flex items-center p-2 rounded hover:bg-gray-700"
              >
                <FiSettings className="mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-auto pt-8">
          <Link 
            href="/" 
            className="flex items-center p-2 rounded hover:bg-gray-700"
          >
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        {children}
      </main>
    </div>
  );
}