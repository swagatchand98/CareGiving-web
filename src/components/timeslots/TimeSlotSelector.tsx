'use client';

import React, { useState, useEffect } from 'react';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { GroupedTimeSlots, TimeSlot } from '@/services/timeSlotService';
import { getServiceById } from '@/services/serviceService';
import Button from '@/components/common/Button';

interface TimeSlotSegment {
  timeSlotId: string;
  start: string;
  end: string;
  isBooked: boolean;
  isReserved?: boolean;
  segmentIndex: number;
}

interface TimeSlotSelectorProps {
  serviceId: string;
  onSelectTimeSlot: (timeSlot: TimeSlot, segment?: TimeSlotSegment) => void;
  selectedTimeSlotId?: string;
  selectedSegmentIndex?: number;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  serviceId,
  onSelectTimeSlot,
  selectedTimeSlotId,
  selectedSegmentIndex
}) => {
  // Hooks from useTimeSlots
  const { fetchServiceTimeSlots, isLoading: apiLoading, error: apiError } = useTimeSlots();
  
  // Component state
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<GroupedTimeSlots>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceDuration, setServiceDuration] = useState<number>(60); // Default to 60 minutes
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);
  
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
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add all dates from the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if this date has time slots
      const hasTimeSlots = groupedTimeSlots[dateStr] && groupedTimeSlots[dateStr].length > 0;
      
      // Include all dates, but disable past dates
      const isPastDate = date < today;
      
      dates.push({
        date,
        dateStr,
        hasTimeSlots,
        isPastDate
      });
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
    console.log(`Selected date: ${dateStr}`);
    console.log(`Time slots for this date:`, groupedTimeSlots[dateStr]);
    setSelectedDate(dateStr);
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot, segmentIndex?: number) => {
    console.log('handleTimeSlotSelect called with segmentIndex:', segmentIndex);
    
    if (segmentIndex !== undefined) {
      // If we have segments from the API, use those
      if (timeSlot.segments && timeSlot.segments.length > 0) {
        const apiSegment = timeSlot.segments.find(s => s.segmentIndex === segmentIndex);
        if (apiSegment) {
          console.log('Using segment from API:', apiSegment);
          const segment: TimeSlotSegment = {
            timeSlotId: timeSlot._id,
            start: apiSegment.startTime,
            end: apiSegment.endTime,
            isBooked: apiSegment.isBooked,
            segmentIndex: apiSegment.segmentIndex
          };
          
          // Only allow selecting segments that are not booked
          if (!segment.isBooked) {
            onSelectTimeSlot(timeSlot, segment);
          } else {
            console.log('Cannot select booked segment');
          }
          return;
        }
      }
      
      // Calculate segment times
      const [startHours, startMinutes] = timeSlot.startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      
      const segmentStartMinutes = startTotalMinutes + (segmentIndex * serviceDuration);
      const segmentEndMinutes = segmentStartMinutes + serviceDuration;
      
      const segmentStartHours = Math.floor(segmentStartMinutes / 60);
      const segmentStartMins = segmentStartMinutes % 60;
      const segmentEndHours = Math.floor(segmentEndMinutes / 60);
      const segmentEndMins = segmentEndMinutes % 60;
      
      const formattedSegmentStart = `${segmentStartHours.toString().padStart(2, '0')}:${segmentStartMins.toString().padStart(2, '0')}`;
      const formattedSegmentEnd = `${segmentEndHours.toString().padStart(2, '0')}:${segmentEndMins.toString().padStart(2, '0')}`;
      
      const segment: TimeSlotSegment = {
        timeSlotId: timeSlot._id,
        start: formattedSegmentStart,
        end: formattedSegmentEnd,
        isBooked: false, // We're only showing available segments
        segmentIndex
      };
      
      console.log('Using calculated segment:', segment);
      onSelectTimeSlot(timeSlot, segment);
    } else {
      onSelectTimeSlot(timeSlot);
    }
  };
  
  // Function to refresh time slots
  const refreshTimeSlots = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing time slots for service:', serviceId);
      
      // Calculate dynamic date range: today and next 60 days
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 60); // Look 60 days ahead
      
      const formattedStartDate = today.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      console.log(`Fetching time slots from ${formattedStartDate} to ${formattedEndDate}`);
      
      const response = await fetchServiceTimeSlots(serviceId, {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      });
      
      console.log('API response received:', response);
      
      // Extract the groupedSlots from the API response
      const groupedSlots = response.groupedSlots as any;
      const slotsCount = Object.keys(groupedSlots).length;
      console.log(`Time slots in response: ${slotsCount}`);
      
      if (slotsCount > 0) {
      // Process the API response to match the expected format
      const processedSlots: GroupedTimeSlots = {};
      
      // Process each date in the response
      Object.keys(groupedSlots).forEach(date => {
        console.log(`Processing date from API: ${date}`);
        
        // Ensure we're using the correct date format (YYYY-MM-DD)
        const dateObj = new Date(date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        console.log(`Formatted date: ${formattedDate}`);
        
        processedSlots[formattedDate] = groupedSlots[date].map((slot: any) => {
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
            segments: slot.segments || [],
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt
          };
        });
      });
        
        console.log('Processed time slots:', processedSlots);
        
        // Update state
        setGroupedTimeSlots(processedSlots);
      } else {
        console.log('No time slots available');
        setGroupedTimeSlots({});
      }
    } catch (err) {
      console.error('Error refreshing time slots:', err);
      setError('Failed to refresh time slots');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set up an interval to refresh time slots every 5 seconds
  useEffect(() => {
    // Initial load
    const loadInitialTimeSlots = async () => {
      await refreshTimeSlots();
    };
    
    loadInitialTimeSlots();
    ``
    // Set up interval for refreshing
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing time slots...');
      refreshTimeSlots();
    }, 25000); // Refresh every 25 seconds
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [serviceId]);
  
  // Add a manual refresh button
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refreshTimeSlots();
  };
  
  // Load service details to get duration
  useEffect(() => {
    const loadServiceDetails = async () => {
      if (!serviceId) return;
      
      setIsLoadingService(true);
      try {
        const response = await getServiceById(serviceId);
        if (response && response.service) {
          setServiceDuration(response.service.duration);
        }
      } catch (err) {
        console.error('Error loading service details:', err);
      } finally {
        setIsLoadingService(false);
      }
    };
    
    loadServiceDetails();
  }, [serviceId]);
  
  // Get dates and available dates for rendering
  const dates = getDatesInMonth();
  const availableDates = Object.keys(groupedTimeSlots);
  
  // Debug log to see what's happening
  console.log('Rendering with groupedTimeSlots:', groupedTimeSlots);
  console.log('Available dates:', availableDates);
  
  // Log each date in the calendar to debug
  dates.forEach(dateInfo => {
    const hasSlots = groupedTimeSlots[dateInfo.dateStr] && groupedTimeSlots[dateInfo.dateStr].length > 0;
    console.log(`Calendar date: ${dateInfo.dateStr}, Has slots: ${hasSlots}, Date: ${dateInfo.date.toDateString()}`);
    if (hasSlots) {
      console.log(`Slots for ${dateInfo.dateStr}:`, groupedTimeSlots[dateInfo.dateStr]);
    }
  });
  
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Select a Date & Time</h2>
        <button 
          onClick={handleManualRefresh}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Refresh
        </button>
      </div>
      
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
        {dates.map(({ date, dateStr, hasTimeSlots, isPastDate }) => (
          <div 
            key={dateStr}
            onClick={() => hasTimeSlots && !isPastDate && handleDateSelect(dateStr)}
            className={`
              p-1 text-center cursor-pointer
              ${isPastDate ? 'text-gray-300 cursor-not-allowed' : 
                hasTimeSlots ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}
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
          
          <div className="grid grid-cols-1 gap-3">
            {groupedTimeSlots[selectedDate].map((timeSlot) => {
              // Use segments from the API response if available, show all segments including booked ones
              const segments = timeSlot.segments || [];
              
              console.log('Time slot:', timeSlot);
              console.log('All segments from API:', timeSlot.segments);
              
              // If no segments are available from the API, calculate them
              if (segments.length === 0) {
                console.warn('No segments found in API response, calculating locally');
                
                const [startHours, startMinutes] = timeSlot.startTime.split(':').map(Number);
                const [endHours, endMinutes] = timeSlot.endTime.split(':').map(Number);
                const startTotalMinutes = startHours * 60 + startMinutes;
                const endTotalMinutes = endHours * 60 + endMinutes;
                const slotDuration = endTotalMinutes - startTotalMinutes;
                
                // Calculate number of segments based on service duration
                const numSegments = Math.floor(slotDuration / serviceDuration);
                
                for (let i = 0; i < numSegments; i++) {
                  const segmentStartMinutes = startTotalMinutes + (i * serviceDuration);
                  const segmentEndMinutes = segmentStartMinutes + serviceDuration;
                  
                  const segmentStartHours = Math.floor(segmentStartMinutes / 60);
                  const segmentStartMins = segmentStartMinutes % 60;
                  const segmentEndHours = Math.floor(segmentEndMinutes / 60);
                  const segmentEndMins = segmentEndMinutes % 60;
                  
                  const formattedSegmentStart = `${segmentStartHours.toString().padStart(2, '0')}:${segmentStartMins.toString().padStart(2, '0')}`;
                  const formattedSegmentEnd = `${segmentEndHours.toString().padStart(2, '0')}:${segmentEndMins.toString().padStart(2, '0')}`;
                  
                  segments.push({
                    _id: `${timeSlot._id}-${i}`,
                    timeSlotId: timeSlot._id,
                    segmentIndex: i,
                    startTime: formattedSegmentStart,
                    endTime: formattedSegmentEnd,
                    isBooked: timeSlot.isBooked,
                    createdAt: timeSlot.createdAt,
                    updatedAt: timeSlot.updatedAt
                  });
                }
              }
              
              // Check if we have any available segments
              const hasAvailableSegments = segments.some(segment => !segment.isBooked);
              
              return (
                <div 
                  key={timeSlot._id} 
                  className="p-3 border rounded-md border-gray-200"
                >
                  <div className="font-medium mb-2">
                    {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                  </div>
                  
                  {/* Show segments */}
                  {segments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Segments ({serviceDuration} min each):</p>
                      <div className="grid grid-cols-4 gap-1">
                        {segments.map((segment) => {
                          console.log('Rendering segment:', segment);
                          return (
                            <button
                              key={segment._id}
                              onClick={() => {
                                if (!segment.isBooked) {
                                  console.log('Segment clicked:', segment);
                                  handleTimeSlotSelect(timeSlot, segment.segmentIndex);
                                } else {
                                  console.log('Cannot select booked segment');
                                }
                              }}
                              disabled={segment.isBooked || segment.isReserved}
                              className={`
                                text-xs px-2 py-2 rounded-md text-left
                                ${selectedTimeSlotId === timeSlot._id && selectedSegmentIndex === segment.segmentIndex
                                  ? 'bg-blue-600 text-white'
                                  : segment.isBooked
                                    ? 'bg-red-50 text-red-700 cursor-not-allowed'
                                    : segment.isReserved
                                      ? 'bg-yellow-50 text-yellow-700 cursor-not-allowed'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }
                              `}
                            >
                              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                              <span className="ml-1 font-medium">
                                {segment.isBooked 
                                  ? '(Booked)' 
                                  : segment.isReserved 
                                    ? '(Reserved)' 
                                    : '(Available)'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;
