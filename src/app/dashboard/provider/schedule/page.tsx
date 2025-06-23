'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import TimeSlotManager from '@/components/timeslots/TimeSlotManager';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useServices } from '@/hooks/useServices';
import { Booking, getProviderBookings } from '@/services/bookingService';
import { GroupedTimeSlots, TimeSlot } from '@/services/timeSlotService';

interface CalendarBooking {
  id: string;
  clientName: string;
  service: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
}

const ProviderSchedulePage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { fetchProviderTimeSlots } = useTimeSlots();
  const { fetchProviderServices } = useServices();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [timeSlots, setTimeSlots] = useState<GroupedTimeSlots>({});
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  
  // Get the current date and week dates
  const today = new Date();
  const currentWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  // Load bookings and time slots
  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/dashboard/provider/schedule');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router, isAuthenticated]);
  
  // Load data when week or month changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'provider') {
      loadData();
    }
  }, [currentWeekStart, currentMonth, calendarView]);
  
  // Load bookings and time slots
  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Determine date range based on current view
      let startDate: Date, endDate: Date;
      
      if (calendarView === 'day') {
        startDate = new Date(selectedDate);
        endDate = new Date(selectedDate);
      } else if (calendarView === 'week') {
        startDate = new Date(currentWeekStart);
        endDate = new Date(currentWeekStart);
        endDate.setDate(endDate.getDate() + 6);
      } else { // month view
        startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      }
      
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch bookings
      const bookingsResponse = await getProviderBookings(1, 100, {
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      // Fetch time slots
      const timeSlotsResponse = await fetchProviderTimeSlots({
        startDate: startDateStr,
        endDate: endDateStr
      });
      
      // Transform bookings to calendar format
      const transformedBookings = bookingsResponse.bookings.map(booking => ({
        id: booking._id,
        clientName: `${booking.userId.firstName} ${booking.userId.lastName}`,
        service: booking.serviceId.title,
        date: new Date(booking.dateTime),
        startTime: new Date(booking.dateTime).toTimeString().substring(0, 5),
        endTime: (() => {
          const endTime = new Date(booking.dateTime);
          endTime.setMinutes(endTime.getMinutes() + booking.duration);
          return endTime.toTimeString().substring(0, 5);
        })(),
        status: booking.status
      }));
      
      setBookings(transformedBookings);
      setTimeSlots(timeSlotsResponse.groupedSlots);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading schedule data:', err);
      setError(err.message || 'Failed to load schedule data');
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (calendarView !== 'day') {
      setCalendarView('day');
    } else {
      // Reload data for the selected date
      loadData();
    }
  };

  // Handle view change
  const handleViewChange = (view: 'day' | 'week' | 'month') => {
    setCalendarView(view);
    // Reset dates based on view
    if (view === 'week') {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      setCurrentWeekStart(weekStart);
    } else if (view === 'month') {
      const monthStart = new Date();
      monthStart.setDate(1);
      setCurrentMonth(monthStart);
    }
  };
  
  // Navigate to previous week/month
  const handlePrevious = () => {
    if (calendarView === 'day') {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDate(prevDay);
    } else if (calendarView === 'week') {
      const prevWeek = new Date(currentWeekStart);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentWeekStart(prevWeek);
    } else { // month view
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentMonth(prevMonth);
    }
  };
  
  // Navigate to next week/month
  const handleNext = () => {
    if (calendarView === 'day') {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDate(nextDay);
    } else if (calendarView === 'week') {
      const nextWeek = new Date(currentWeekStart);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentWeekStart(nextWeek);
    } else { // month view
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentMonth(nextMonth);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is not authenticated, show a message or redirect
  if (!isAuthenticated) {
    return null; // We'll redirect in the useEffect hook
  }
  
  // Ensure user is not null before rendering
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ProviderHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Schedule Management</h1>
              <p className="text-gray-600">Manage your availability and view upcoming bookings</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/provider')}
              variant="outline"
              className="px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'calendar'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Calendar View
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'availability'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Manage Availability
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bookings'
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Upcoming Bookings
                </button>
              </nav>
            </div>
          </div>
          
          {/* Calendar View */}
          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Schedule Calendar</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewChange('day')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      calendarView === 'day'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => handleViewChange('week')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      calendarView === 'week'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => handleViewChange('month')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      calendarView === 'month'
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Month
                  </button>
                </div>
              </div>
              
              {/* Week Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={handlePrevious}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <h3 className="font-medium">
                  {calendarView === 'day' 
                    ? formatDate(selectedDate)
                    : calendarView === 'week'
                      ? `${formatDate(currentWeek[0])} - ${formatDate(currentWeek[6])}`
                      : `${currentMonth.toLocaleString('default', { month: 'long' })} ${currentMonth.getFullYear()}`
                  }
                </h3>
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={handleNext}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              {/* Week View */}
              {calendarView === 'week' && (
                <div className="border rounded-lg overflow-hidden">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 border-b">
                    {currentWeek.map((date, index) => (
                      <div 
                        key={index} 
                        className={`p-2 text-center ${
                          date.toDateString() === today.toDateString() 
                            ? 'bg-blue-50' 
                            : ''
                        }`}
                      >
                        <div className="font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-sm ${
                          date.toDateString() === today.toDateString() 
                            ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto' 
                            : ''
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Time Slots */}
                  <div className="grid grid-cols-7 divide-x h-96 overflow-y-auto">
                    {currentWeek.map((date, dateIndex) => (
                      <div key={dateIndex} className="relative">
                        {/* Time indicators */}
                        {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                          <div key={hour} className="border-t h-12 text-xs text-gray-500 pl-1">
                            {hour}:00
                          </div>
                        ))}
                        
                        {/* Bookings */}
                        {bookings
                          .filter(booking => booking.date.toDateString() === date.toDateString())
                          .map(booking => {
                            const startHour = parseInt(booking.startTime.split(':')[0]);
                            const startMinute = parseInt(booking.startTime.split(':')[1]);
                            const endHour = parseInt(booking.endTime.split(':')[0]);
                            const endMinute = parseInt(booking.endTime.split(':')[1]);
                            
                            const startPosition = (startHour - 8) * 48 + startMinute * 0.8;
                            const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
                            
                            return (
                              <div
                                key={booking.id}
                                className={`absolute left-0 right-0 mx-1 p-1 rounded text-xs cursor-pointer ${
                                  booking.status === 'confirmed' || booking.status === 'in-progress'
                                    ? 'bg-blue-100 border-l-4 border-blue-500' 
                                    : booking.status === 'completed'
                                      ? 'bg-green-100 border-l-4 border-green-500'
                                      : 'bg-yellow-100 border-l-4 border-yellow-500'
                                }`}
                                style={{
                                  top: `${startPosition}px`,
                                  height: `${duration}px`,
                                }}
                                onClick={() => router.push(`/booking/${booking.id}`)}
                              >
                                <div className="font-medium truncate">{booking.clientName}</div>
                                <div className="truncate">{booking.service}</div>
                                <div>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                              </div>
                            );
                          })}
                          
                        {/* Time slots */}
                        {Object.entries(timeSlots)
                          .filter(([dateStr]) => new Date(dateStr).toDateString() === date.toDateString())
                          .flatMap(([_, slots]) => slots)
                          .filter(slot => !slot.isBooked)
                          .map(slot => {
                            const startHour = parseInt(slot.startTime.split(':')[0]);
                            const startMinute = parseInt(slot.startTime.split(':')[1]);
                            const endHour = parseInt(slot.endTime.split(':')[0]);
                            const endMinute = parseInt(slot.endTime.split(':')[1]);
                            
                            const startPosition = (startHour - 8) * 48 + startMinute * 0.8;
                            const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 0.8;
                            
                            return (
                              <div
                                key={slot._id}
                                className="absolute left-0 right-0 mx-1 p-1 rounded text-xs bg-gray-100 border-l-4 border-gray-400"
                                style={{
                                  top: `${startPosition}px`,
                                  height: `${duration}px`,
                                }}
                              >
                                <div className="font-medium truncate">Available</div>
                                <div>{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Day View */}
              {calendarView === 'day' && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-3 bg-gray-50 border-b">
                    <h3 className="font-medium text-center">{formatDate(selectedDate)}</h3>
                  </div>
                  
                  <div className="h-96 overflow-y-auto relative">
                    {/* Time indicators */}
                    {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => (
                      <div key={hour} className="border-t h-16 flex">
                        <div className="w-16 text-xs text-gray-500 p-1 text-right pr-2 border-r">
                          {hour}:00
                        </div>
                        <div className="flex-1"></div>
                      </div>
                    ))}
                    
                    {/* Bookings */}
                    {bookings
                      .filter(booking => booking.date.toDateString() === selectedDate.toDateString())
                      .map(booking => {
                        const startHour = parseInt(booking.startTime.split(':')[0]);
                        const startMinute = parseInt(booking.startTime.split(':')[1]);
                        const endHour = parseInt(booking.endTime.split(':')[0]);
                        const endMinute = parseInt(booking.endTime.split(':')[1]);
                        
                        const startPosition = (startHour - 7) * 64 + startMinute * 1.066;
                        const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 1.066;
                        
                        return (
                          <div
                            key={booking.id}
                            className={`absolute left-16 right-0 mx-2 p-2 rounded cursor-pointer ${
                              booking.status === 'confirmed' || booking.status === 'in-progress'
                                ? 'bg-blue-100 border-l-4 border-blue-500' 
                                : booking.status === 'completed'
                                  ? 'bg-green-100 border-l-4 border-green-500'
                                  : 'bg-yellow-100 border-l-4 border-yellow-500'
                            }`}
                            style={{
                              top: `${startPosition}px`,
                              height: `${duration}px`,
                            }}
                            onClick={() => router.push(`/booking/${booking.id}`)}
                          >
                            <div className="font-medium">{booking.clientName}</div>
                            <div>{booking.service}</div>
                            <div className="text-sm">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</div>
                          </div>
                        );
                      })}
                      
                    {/* Time slots */}
                    {Object.entries(timeSlots)
                      .filter(([dateStr]) => new Date(dateStr).toDateString() === selectedDate.toDateString())
                      .flatMap(([_, slots]) => slots)
                      .filter(slot => !slot.isBooked)
                      .map(slot => {
                        const startHour = parseInt(slot.startTime.split(':')[0]);
                        const startMinute = parseInt(slot.startTime.split(':')[1]);
                        const endHour = parseInt(slot.endTime.split(':')[0]);
                        const endMinute = parseInt(slot.endTime.split(':')[1]);
                        
                        const startPosition = (startHour - 7) * 64 + startMinute * 1.066;
                        const duration = ((endHour - startHour) * 60 + (endMinute - startMinute)) * 1.066;
                        
                        return (
                          <div
                            key={slot._id}
                            className="absolute left-16 right-0 mx-2 p-2 rounded bg-gray-100 border-l-4 border-gray-400"
                            style={{
                              top: `${startPosition}px`,
                              height: `${duration}px`,
                            }}
                          >
                            <div className="font-medium">Available</div>
                            <div className="text-sm">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
              
              {/* Month View */}
              {calendarView === 'month' && (
                <div className="border rounded-lg overflow-hidden">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 text-center border-b">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-2 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 grid-rows-5 h-96">
                    {Array.from({ length: 35 }, (_, i) => {
                      const date = new Date(today.getFullYear(), today.getMonth(), 1);
                      date.setDate(i - date.getDay() + 1);
                      return date;
                    }).map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                      const isToday = date.toDateString() === today.toDateString();
                      const hasBookings = bookings.some(booking => 
                        booking.date.toDateString() === date.toDateString()
                      );
                      const hasTimeSlots = Object.entries(timeSlots)
                        .some(([dateStr, slots]) => 
                          new Date(dateStr).toDateString() === date.toDateString() && 
                          slots.some(slot => !slot.isBooked)
                        );
                      
                      return (
                        <div 
                          key={index} 
                          className={`border p-1 ${
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                          } ${
                            isToday ? 'border-blue-500' : ''
                          }`}
                          onClick={() => handleDateClick(date)}
                        >
                          <div className={`text-right mb-1 ${
                            isToday 
                              ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' 
                              : ''
                          }`}>
                            {date.getDate()}
                          </div>
                          
                          <div className="mt-1">
                            {hasBookings && bookings
                              .filter(booking => booking.date.toDateString() === date.toDateString())
                              .slice(0, 2) // Show max 2 bookings per day in month view
                              .map(booking => (
                                <div 
                                  key={booking.id} 
                                  className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${
                                    booking.status === 'confirmed' || booking.status === 'in-progress'
                                      ? 'bg-blue-100 text-blue-800' 
                                      : booking.status === 'completed'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                  onClick={() => router.push(`/booking/${booking.id}`)}
                                >
                                  {formatTime(booking.startTime)} {booking.clientName}
                                </div>
                              ))}
                              
                            {hasTimeSlots && (
                              <div className="text-xs p-1 mb-1 rounded truncate bg-gray-100 text-gray-800">
                                Available slots
                              </div>
                            )}
                            
                            {hasBookings && bookings.filter(booking => 
                              booking.date.toDateString() === date.toDateString()
                            ).length > 2 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{bookings.filter(booking => 
                                  booking.date.toDateString() === date.toDateString()
                                ).length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Availability Management */}
          {activeTab === 'availability' && (
            <div>
              {user && <TimeSlotManager providerId={user.id} />}
            </div>
          )}
          
          {/* Upcoming Bookings */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You don't have any upcoming bookings.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings
                    .filter(booking => 
                      booking.status === 'confirmed' || 
                      booking.status === 'pending' || 
                      booking.status === 'in-progress'
                    )
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((booking) => (
                      <div 
                        key={booking.id} 
                        className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <h3 className="font-medium">{booking.service}</h3>
                          <p className="text-gray-600">Client: {booking.clientName}</p>
                          <p className="text-gray-600">
                            {formatDate(booking.date)} • {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </p>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          <div className="ml-4">
                            <Button 
                              variant="outline" 
                              className="text-sm px-3 py-1"
                              onClick={() => router.push(`/booking/${booking.id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProviderSchedulePage;
