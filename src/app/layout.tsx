import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import Header from '@/components/Header';
import FooterOptimized from '@/components/FooterOptimized';
import SyncToast from '@/components/SyncToast';
import AutoSync from '@/components/AutoSync';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shreeji International - Wholesale Indian Grocery',
  description: 'Premium wholesale Indian grocery products for retailers and businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen flex flex-col`}>
        <AppProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <FooterOptimized />
          <SyncToast />
          <AutoSync />
          <Toaster position="bottom-right" />
        </AppProvider>
        
        {/* Firebase initialization script */}
        {/* Firebase config is handled in lib/firebase.ts */}
      </body>
    </html>
  );
}