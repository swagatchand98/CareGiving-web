'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-6 mx-auto">
            <div className="h-40 w-40 mx-auto flex items-center justify-center rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">404</h1>
          <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
          
          <p className="text-gray-600 mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Go Back
            </button>
            
            <Link 
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Looking for something?</h3>
            <p className="text-gray-600">
              Try searching for what you need or browse our services.
            </p>
            <div className="mt-4">
              <Link 
                href="/services/browse"
                className="text-blue-600 hover:underline"
              >
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
