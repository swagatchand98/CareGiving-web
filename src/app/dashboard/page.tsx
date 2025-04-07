'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticatedHeader from '@/components/layout/AuthenticatedHeader';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Button from '@/components/common/Button';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedHeader user={user} />
      
      <main className="flex-grow">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-gray-100 to-gray-200 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-gray-600">Here's what's happening with your caregiving services.</p>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium">Elder Care Session</p>
                    <p className="text-sm text-gray-600">Tomorrow, 10:00 AM</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium">Child Care Session</p>
                    <p className="text-sm text-gray-600">May 8, 2:00 PM</p>
                  </div>
                </div>
                <Link href="/bookings" className="block mt-4 text-blue-600 hover:underline">
                  View all appointments →
                </Link>
              </div>
              
              {/* Recent Messages */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Messages</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <span>S</span>
                    </div>
                    <div>
                      <p className="font-medium">Sarah Johnson</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        Hi there! Just confirming our appointment for tomorrow...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                      <span>M</span>
                    </div>
                    <div>
                      <p className="font-medium">Michael Smith</p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        Thank you for the great service last week...
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                    </div>
                  </div>
                </div>
                <Link href="/messages" className="block mt-4 text-blue-600 hover:underline">
                  View all messages →
                </Link>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/services/browse">
                    <Button variant="secondary" fullWidth>
                      Browse Services
                    </Button>
                  </Link>
                  <Link href="/bookings/new">
                    <Button fullWidth>
                      Book New Appointment
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="secondary" fullWidth>
                      Update Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Recent Services */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-6">Recommended Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Service Card 1 */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="rounded-lg h-40 mb-4 overflow-hidden">
                    <img 
                      src="/images/placeholders/elder-care.svg" 
                      alt="Elder Care" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Elder Care</h3>
                  <p className="text-gray-600 mb-4">
                    Compassionate care for seniors in the comfort of their own homes.
                  </p>
                  <Link href="/services/details/elder-care" className="text-black font-medium hover:underline">
                    Learn More →
                  </Link>
                </div>
                
                {/* Service Card 2 */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="rounded-lg h-40 mb-4 overflow-hidden">
                    <img 
                      src="/images/placeholders/child-care.svg" 
                      alt="Child Care" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Child Care</h3>
                  <p className="text-gray-600 mb-4">
                    Professional and loving care for children of all ages.
                  </p>
                  <Link href="/services/details/child-care" className="text-black font-medium hover:underline">
                    Learn More →
                  </Link>
                </div>
                
                {/* Service Card 3 */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="rounded-lg h-40 mb-4 overflow-hidden">
                    <img 
                      src="/images/placeholders/special-needs.svg" 
                      alt="Special Needs Care" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Special Needs Care</h3>
                  <p className="text-gray-600 mb-4">
                    Specialized care for individuals with special needs or disabilities.
                  </p>
                  <Link href="/services/details/special-needs" className="text-black font-medium hover:underline">
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
