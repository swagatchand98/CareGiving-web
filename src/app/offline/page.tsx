'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function OfflinePage() {
  const router = useRouter();

  // Function to check if we're back online and redirect
  const checkConnection = () => {
    if (navigator.onLine) {
      router.back();
    } else {
      alert('You are still offline. Please check your internet connection.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-6 mx-auto">
            <div className="h-40 w-40 mx-auto flex items-center justify-center rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a5 5 0 010-7.072m-6.364 0a5 5 0 010 7.072m3.536 3.536a9 9 0 010-12.728" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">You're Offline</h1>
          
          <p className="text-gray-600 mb-6">
            It looks like you've lost your internet connection. 
            Please check your network settings and try again.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={checkConnection}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            
            <Link 
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="font-semibold mb-2">Things you can try:</h2>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Check your Wi-Fi connection</li>
              <li>• Check your mobile data connection</li>
              <li>• Restart your router</li>
              <li>• Contact your internet service provider</li>
            </ul>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
