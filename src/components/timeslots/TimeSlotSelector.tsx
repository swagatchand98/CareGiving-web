'use client';

import React, { useState, useEffect } from 'react';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { GroupedTimeSlots, TimeSlot } from '@/services/timeSlotService';
import Button from '@/components/common/Button';

interface TimeSlotSelectorProps {
  serviceId: string;
  onSelectTimeSlot: (timeSlot: TimeSlot) => void;
  selectedTimeSlotId?: string;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  serviceId,
  onSelectTimeSlot,
  selectedTimeSlotId
}) => {
  // Hooks from useTimeSlots
  const { fetchServiceTimeSlots, isLoading: apiLoading, error: apiError } = useTimeSlots();
  
  // Component state
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<GroupedTimeSlots>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
  // Get dates for the current month
  const getDatesInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add dates from the current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      
      // Only include dates from today onwards
      if (date >= today) {
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if this date has time slots
        const hasTimeSlots = groupedTimeSlots[dateStr] && groupedTimeSlots[dateStr].length > 0;
        
        dates.push({
          date,
          dateStr,
          hasTimeSlots
        });
      }
    }
    
    return dates;
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    // Don't allow navigating to past months
    if (previousMonth.getMonth() >= today.getMonth() || previousMonth.getFullYear() > today.getFullYear()) {
      setCurrentMonth(previousMonth);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  // Handle date selection
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    onSelectTimeSlot(timeSlot);
  };
  
  // Ref to track if we've already made the API call for this service
  const apiCallMadeRef = React.useRef<string | null>(null);
  
  // Load time slots for the service
  useEffect(() => {
    // Skip if we've already made the API call for this service
    if (apiCallMadeRef.current === serviceId) {
      console.log('API call already made for this service, skipping');
      return;
    }
    
    // Set the flag immediately to prevent multiple calls
    apiCallMadeRef.current = serviceId;
    
    const loadTimeSlots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Loading time slots for service:', serviceId);
        
        // Make the API call to get time slots
        console.log('Making API call to get time slots');
        const response = await fetchServiceTimeSlots(serviceId, {
          startDate: '2025-05-07',
          endDate: '2025-06-06'
        });
        
        console.log('API response received:', response);
        
        // Extract the groupedSlots from the API response
        const groupedSlots = response.groupedSlots as any;
        const slotsCount = Object.keys(groupedSlots).length;
        console.log(`Time slots in response: ${slotsCount}`);
        
        if (slotsCount > 0) {
          const firstDate = Object.keys(groupedSlots)[0];
          console.log('First date in response:', firstDate);
          
          // Process the API response to match the expected format
          const processedSlots: GroupedTimeSlots = {};
          
          // Process each date in the response
          Object.keys(groupedSlots).forEach(date => {
            processedSlots[date] = groupedSlots[date].map((slot: any) => {
              // Extract providerId as string if it's an object
              const providerId = typeof slot.providerId === 'object' && slot.providerId !== null
                ? slot.providerId._id
                : slot.providerId;
              
              // Return a new object with the correct format
              return {
                _id: slot._id,
                providerId,
                serviceId: slot.serviceId,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isBooked: slot.isBooked,
                createdAt: slot.createdAt,
                updatedAt: slot.updatedAt
              };
            });
          });
          
          console.log('Processed time slots:', processedSlots);
          
          // Update all state at once to minimize re-renders
          const firstAvailableDate = new Date(firstDate);
          const newCurrentMonth = new Date(firstAvailableDate.getFullYear(), firstAvailableDate.getMonth(), 1);
          
          // Set all state at once
          setGroupedTimeSlots(processedSlots);
          setSelectedDate(firstDate);
          setCurrentMonth(newCurrentMonth);
        } else {
          console.log('No time slots available');
          setGroupedTimeSlots({});
          setSelectedDate(null);
        }
      } catch (err) {
        console.error('Error loading time slots:', err);
        setError('Failed to load time slots');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTimeSlots();
  }, [serviceId, fetchServiceTimeSlots]);
  
  // Get dates and available dates for rendering
  const dates = getDatesInMonth();
  const availableDates = Object.keys(groupedTimeSlots);
  
  // Debug log to see what's happening
  console.log('Rendering with groupedTimeSlots:', groupedTimeSlots);
  console.log('Available dates:', availableDates);
  
  // Show loading state if we're still loading time slots
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading available time slots...</span>
      </div>
    );
  }
  
  // Show error if there is one
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  // If after all attempts we still have no time slots, show a message
  if (!isLoading && availableDates.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        No available time slots for this service. Please check back later.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Select a Date & Time</h2>
      
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <h3 className="text-lg font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
      
      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: dates[0]?.date.getDay() || 0 }).map((_, index) => (
          <div key={`empty-${index}`} className="p-1"></div>
        ))}
        
        {/* Date cells */}
        {dates.map(({ date, dateStr, hasTimeSlots }) => (
          <div 
            key={dateStr}
            onClick={() => hasTimeSlots && handleDateSelect(dateStr)}
            className={`
              p-1 text-center cursor-pointer
              ${hasTimeSlots ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}
              ${selectedDate === dateStr ? 'bg-blue-100 text-blue-800' : ''}
              ${dateStr === new Date().toISOString().split('T')[0] ? 'border border-blue-500' : ''}
            `}
          >
            <div className="text-sm">
              {date.getDate()}
            </div>
            {hasTimeSlots && (
              <div className="text-xs text-green-600 mt-1">
                {groupedTimeSlots[dateStr].length} slots
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Time Slots */}
      {selectedDate && groupedTimeSlots[selectedDate] && (
        <div>
          <h3 className="font-medium mb-2">
            Available Times for {formatDate(selectedDate)}
          </h3>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {groupedTimeSlots[selectedDate].map((timeSlot) => (
              <button
                key={timeSlot._id}
                onClick={() => handleTimeSlotSelect(timeSlot)}
                className={`
                  py-2 px-3 text-sm border rounded-md text-center
                  ${selectedTimeSlotId === timeSlot._id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
