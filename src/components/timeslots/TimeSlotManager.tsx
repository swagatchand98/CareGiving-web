'use client';

import React, { useState, useEffect } from 'react';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useServices } from '@/hooks/useServices';
import { GroupedTimeSlots, TimeSlot, TimeSlotCreateData } from '@/services/timeSlotService';
import { Service } from '@/services/serviceService';
import Button from '@/components/common/Button';

interface TimeSlotManagerProps {
  providerId: string;
}

const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({ providerId }) => {
  const { 
    fetchProviderTimeSlots, 
    createNewTimeSlots, 
    updateExistingTimeSlot, 
    deleteExistingTimeSlot, 
    isLoading, 
    error 
  } = useTimeSlots();
  
  const { fetchProviderServices } = useServices();
  
  const [groupedTimeSlots, setGroupedTimeSlots] = useState<GroupedTimeSlots>({});
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Load provider's services
  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log('Loading services for provider:', providerId);
        const response = await fetchProviderServices(1, 100);
        
        // Check if we got a valid response with services
        if (!response || !response.services || response.services.length === 0) {
          console.log('No services returned or empty response');
          setServices([]);
          return;
        }
        
        console.log('Provider services:', response.services);
        setServices(response.services);
        
        // Set selected service to the first service if available
        if (response.services.length > 0) {
          setSelectedServiceId(response.services[0]._id);
        }
      } catch (err: any) {
        console.error('Error loading services:', err);
        setErrorMessage('Unable to load services. Please try again later.');
      }
    };
    
    loadServices();
  }, [providerId, fetchProviderServices]);
  
  // Load provider's time slots
  useEffect(() => {
    if (selectedServiceId) {
      loadTimeSlots();
    }
  }, [selectedServiceId]);
  
  const loadTimeSlots = async (retryCount = 0) => {
    try {
      console.log('Loading time slots for service:', selectedServiceId);
      
      // Get time slots for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const response = await fetchProviderTimeSlots({
        serviceId: selectedServiceId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      console.log('Time slots loaded:', response.groupedSlots);
      setGroupedTimeSlots(response.groupedSlots);
      setErrorMessage(null); // Clear any previous error messages
    } catch (err: any) {
      console.error('Error loading time slots:', err);
      
      // Handle timeout or rate limit errors with retry logic
      if ((err.message?.includes('timeout') || err.response?.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying time slots in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        await loadTimeSlots(retryCount + 1);
      } else if (retryCount >= 3) {
        // After 3 retries, show a more user-friendly error
        setErrorMessage('Unable to load time slots. Please try again later.');
      }
    }
  };
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
  
  // Handle service selection
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
  };
  
  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
  
  // Handle start time selection
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    
    // Automatically set end time to 1 hour after start time
    const [hours, minutes] = e.target.value.split(':').map(Number);
    const endHours = hours + 1;
    const formattedEndHours = endHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    setEndTime(`${formattedEndHours}:${formattedMinutes}`);
  };
  
  // Handle end time selection
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };
  
  // Create time slot
  const handleCreateTimeSlot = async (retryCount = 0) => {
    if (!selectedServiceId) {
      setErrorMessage('Please select a service');
      return;
    }
    
    if (!selectedDate) {
      setErrorMessage('Please select a date');
      return;
    }
    
    if (!startTime || !endTime) {
      setErrorMessage('Please select start and end times');
      return;
    }
    
    // Validate that end time is after start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    if (endTotalMinutes <= startTotalMinutes) {
      setErrorMessage('End time must be after start time');
      return;
    }
    
    try {
      setIsCreating(true);
      
      const data: TimeSlotCreateData = {
        serviceId: selectedServiceId,
        slots: [
          {
            date: selectedDate,
            startTime,
            endTime
          }
        ]
      };
      
      console.log('Creating time slot:', data);
      await createNewTimeSlots(data);
      console.log('Time slot created successfully');
      
      // Reload time slots
      await loadTimeSlots();
      
      // Reset form
      setStartTime('09:00');
      setEndTime('10:00');
      
      // Show success message
      setSuccessMessage('Time slot created successfully');
      setErrorMessage(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error creating time slot:', err);
      
      // Handle timeout or rate limit errors with retry logic
      if ((err.message?.includes('timeout') || err.response?.status === 429) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Retrying time slot creation in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
        
        // Wait for the delay period
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with exponential backoff
        await handleCreateTimeSlot(retryCount + 1);
      } else {
        setErrorMessage(err.message || 'Failed to create time slot');
      }
    } finally {
      if (retryCount === 0) { // Only reset creating state on the initial call or final retry
        setIsCreating(false);
      }
    }
  };
  
  // Delete time slot
  const handleDeleteTimeSlot = async (timeSlotId: string, retryCount = 0) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        console.log('Deleting time slot:', timeSlotId);
        await deleteExistingTimeSlot(timeSlotId);
        console.log('Time slot deleted successfully');
        
        // Reload time slots
        await loadTimeSlots();
        
        // Show success message
        setSuccessMessage('Time slot deleted successfully');
        setErrorMessage(null);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (err: any) {
        console.error('Error deleting time slot:', err);
        
        // Handle timeout or rate limit errors with retry logic
        if ((err.message?.includes('timeout') || err.response?.status === 429) && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying time slot deletion in ${delay}ms... (Attempt ${retryCount + 1}/3)`);
          
          // Wait for the delay period
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Retry with exponential backoff
          await handleDeleteTimeSlot(timeSlotId, retryCount + 1);
        } else {
          setErrorMessage(err.message || 'Failed to delete time slot');
        }
      }
    }
  };
  
  // Generate time options for select inputs
  const generateTimeOptions = () => {
    const options = [];
    
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        options.push(time);
      }
    }
    
    return options;
  };
  
  const timeOptions = generateTimeOptions();
  
  if (services.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        You don't have any services yet. Please create a service first.
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Manage Time Slots</h2>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {(error || errorMessage) && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error || errorMessage}
        </div>
      )}
      
      {/* Service Selection */}
      <div className="mb-6">
        <label htmlFor="service" className="block text-sm font-medium mb-1">
          Select Service
        </label>
        <select
          id="service"
          value={selectedServiceId}
          onChange={handleServiceChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>
      
      {/* Create Time Slot Form */}
      <div className="mb-6 p-4 border border-gray-200 rounded-md">
        <h3 className="font-medium mb-3">Create New Time Slot</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Date Selection */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
          
          {/* Start Time Selection */}
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium mb-1">
              Start Time
            </label>
            <select
              id="startTime"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            >
              {timeOptions.map((time) => (
                <option key={`start-${time}`} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>
          
          {/* End Time Selection */}
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium mb-1">
              End Time
            </label>
            <select
              id="endTime"
              value={endTime}
              onChange={(e) => handleEndTimeChange(e as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            >
              {timeOptions.map((time) => (
                <option key={`end-${time}`} value={time}>
                  {formatTime(time)}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <Button
          onClick={() => handleCreateTimeSlot()}
          disabled={isCreating || isLoading}
          fullWidth
        >
          {isCreating ? 'Creating...' : 'Create Time Slot'}
        </Button>
      </div>
      
      {/* Time Slots List */}
      <div>
        <h3 className="font-medium mb-3">Your Time Slots</h3>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : Object.keys(groupedTimeSlots).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You don't have any time slots for this service yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedTimeSlots)
              .sort()
              .map((dateStr) => (
                <div key={dateStr} className="border-b pb-4">
                  <h4 className="font-medium mb-2">{formatDate(dateStr)}</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedTimeSlots[dateStr].map((timeSlot) => (
                      <div 
                        key={timeSlot._id} 
                        className={`
                          p-3 border rounded-md flex justify-between items-center
                          ${timeSlot.isBooked ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                        `}
                      >
                        <div>
                          <div className="font-medium">
                            {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {timeSlot.isBooked ? 'Booked' : 'Available'}
                          </div>
                        </div>
                        
                        {!timeSlot.isBooked && (
                          <button
                            onClick={() => handleDeleteTimeSlot(timeSlot._id, 0)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotManager;
