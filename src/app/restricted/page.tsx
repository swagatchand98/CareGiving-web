'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import PublicHeader from '@/components/layout/PublicHeader';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';

export default function RestrictedPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Get query parameters
  const getQueryParam = (param: string): string | null => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }
    return null;
  };

  const role = getQueryParam('role');
  const requiredRole = role || 'specific role';
  const returnUrl = getQueryParam('returnUrl') || '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {user ? <EnhancedHeader user={user} /> : <PublicHeader />}
      
      <main className="flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="mb-6 mx-auto">
            <div className="h-40 w-40 mx-auto flex items-center justify-center rounded-full bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V9m0 0V7m0 2h2m-2 0H9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          
          <p className="text-gray-600 mb-6">
            {isAuthenticated ? (
              <>
                You don't have permission to access this page. This area requires <span className="font-semibold">{requiredRole}</span> privileges.
              </>
            ) : (
              <>
                You need to sign in to access this page. This area requires <span className="font-semibold">{requiredRole}</span> privileges.
              </>
            )}
          </p>
          
          <div className="space-y-4">
            {!isAuthenticated && (
              <Link 
                href={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`}
                className="block w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            )}
            
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
          
          {isAuthenticated && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h2 className="font-semibold mb-2">Need access?</h2>
              <p className="text-gray-600">
                If you believe you should have access to this page, please contact support or your administrator.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
