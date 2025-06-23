'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-6 mx-auto">
            <div className="h-40 w-40 mx-auto flex items-center justify-center rounded-full bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Something Went Wrong</h1>
          
          <p className="text-gray-600 mb-6">
            We're sorry, but something went wrong. Our team has been notified and is working to fix the issue.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              Go Back
            </button>
            
            <Link 
              href="/"
              className="block w-full text-blue-600 py-2 hover:underline"
            >
              Return to Homepage
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-left">
              <h3 className="font-semibold mb-2">Error Details (Development Only):</h3>
              <p className="text-red-600 text-sm mb-2">
                {error.name}: {error.message}
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
