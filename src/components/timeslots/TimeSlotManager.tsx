'use client';

import React, { useState, useEffect } from 'react';
import { useTimeSlots } from '@/hooks/useTimeSlots';
import { useServices } from '@/hooks/useServices';
import { GroupedTimeSlots, TimeSlot, TimeSlotCreateData } from '@/services/timeSlotService';
import { Service, getServiceById } from '@/services/serviceService';
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
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingService, setIsLoadingService] = useState<boolean>(false);
  
  // Use a ref to track if we've already tried to load services
  const servicesLoadAttempted = React.useRef(false);
  
  // Load provider's services
  useEffect(() => {
    // Skip if we've already tried to load services
    if (servicesLoadAttempted.current) {
      return;
    }
    
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    const loadServices = async () => {
      // Mark that we've attempted to load services
      servicesLoadAttempted.current = true;
      
      try {
        // Check if we have a valid token in localStorage
        const userData = localStorage.getItem('user');
        if (!userData) {
          console.error('No user data found in localStorage');
          if (isMounted) setErrorMessage('Authentication error. Please log in again.');
          return;
        }
        
        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData.token) {
          console.error('No token found in user data');
          if (isMounted) setErrorMessage('Authentication error. Please log in again.');
          return;
        }
        
        console.log('Loading services for provider:', providerId);
        const response = await fetchProviderServices(1, 100);
        
        // Check if we got a valid response with services
        if (!response || !response.services || response.services.length === 0) {
          console.log('No services returned or empty response');
          if (isMounted) setServices([]);
          return;
        }
        
        console.log('Provider services:', response.services);
        if (isMounted) {
          setServices(response.services);
          
          // Set selected service to the first service if available
          if (response.services.length > 0) {
            const firstServiceId = response.services[0]._id;
            setSelectedServiceId(firstServiceId);
            
            // Also load the first service details
            try {
              setIsLoadingService(true);
              const serviceResponse = await getServiceById(firstServiceId);
              if (isMounted) {
                setSelectedService(serviceResponse.service);
              }
            } catch (err) {
              console.error('Error loading service details:', err);
            } finally {
              if (isMounted) {
                setIsLoadingService(false);
              }
            }
          }
        }
      } catch (err: any) {
        console.error('Error loading services:', err);
        if (isMounted) setErrorMessage('Unable to load services. Please try again later.');
      }
    };
    
    // Add a small delay to ensure authentication is fully established
    const timer = setTimeout(() => {
      loadServices();
    }, 500);
    
    // Cleanup function to set the flag when the component unmounts
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [providerId]);
  
  // Use a ref to track if we've already tried to load time slots
  const timeSlotsLoadAttempted = React.useRef(false);
  
  // Load provider's time slots
  useEffect(() => {
    if (selectedServiceId) {
      // Reset the load attempt flag when service changes
      timeSlotsLoadAttempted.current = false;
      loadTimeSlots();
    }
  }, [selectedServiceId]);
  
  const loadTimeSlots = async () => {
    // Skip if we've already tried to load time slots for this service
    if (timeSlotsLoadAttempted.current) {
      return;
    }
    
    // Create a flag to track if the component is mounted
    let isMounted = true;
    
    try {
      // Mark that we've attempted to load time slots
      timeSlotsLoadAttempted.current = true;
      
      // Check if we have a valid token in localStorage
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.error('No user data found in localStorage');
        if (isMounted) setErrorMessage('Authentication error. Please log in again.');
        return;
      }
      
      const parsedUserData = JSON.parse(userData);
      if (!parsedUserData.token) {
        console.error('No token found in user data');
        if (isMounted) setErrorMessage('Authentication error. Please log in again.');
        return;
      }
      
      console.log('Loading time slots for service:', selectedServiceId);
      
      // Get time slots for the next 60 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
      
      // Add a small delay to ensure authentication is fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetchProviderTimeSlots({
        serviceId: selectedServiceId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      console.log('Time slots loaded:', response.groupedSlots);
      if (isMounted) {
        setGroupedTimeSlots(response.groupedSlots);
        setErrorMessage(null); // Clear any previous error messages
      }
    } catch (err: any) {
      console.error('Error loading time slots:', err);
      if (isMounted) setErrorMessage('Unable to load time slots. Please try again later.');
    }
    
    // Return a cleanup function
    return () => {
      isMounted = false;
    };
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
  const handleServiceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newServiceId = e.target.value;
    setSelectedServiceId(newServiceId);
    
    // Fetch the selected service details to get its duration
    try {
      setIsLoadingService(true);
      const response = await getServiceById(newServiceId);
      setSelectedService(response.service);
      setIsLoadingService(false);
    } catch (err: any) {
      console.error('Error fetching service details:', err);
      setErrorMessage('Failed to load service details');
      setIsLoadingService(false);
    }
  };
  
  // Handle date selection
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
  
  // Handle start time selection
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(e.target.value);
    
    // Automatically set end time based on service duration
    if (selectedService) {
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes;
      
      // Add service duration to get end time
      const endTotalMinutes = totalMinutes + selectedService.duration;
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      
      const formattedEndHours = endHours.toString().padStart(2, '0');
      const formattedMinutes = endMinutes.toString().padStart(2, '0');
      setEndTime(`${formattedEndHours}:${formattedMinutes}`);
    } else {
      // Default to 1 hour if service details not available
      const [hours, minutes] = e.target.value.split(':').map(Number);
      const endHours = hours + 1;
      const formattedEndHours = endHours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      setEndTime(`${formattedEndHours}:${formattedMinutes}`);
    }
  };
  
  // Handle end time selection
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(e.target.value);
  };
  
  // Create time slot
  const handleCreateTimeSlot = async () => {
    if (!selectedServiceId) {
      setErrorMessage('Please select a service');
      return;
    }
    
    if (!selectedService) {
      setErrorMessage('Service details not loaded');
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
    
    // Calculate time slot duration in minutes
    const slotDuration = endTotalMinutes - startTotalMinutes;
    
    // Check if time slot is long enough for the service
    if (slotDuration < selectedService.duration) {
      setErrorMessage(`Time slot must be at least ${selectedService.duration} minutes long for this service`);
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
      
      // Add a small delay to ensure authentication is fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      setErrorMessage(err.message || 'Failed to create time slot');
    } finally {
      setIsCreating(false);
    }
  };
  
  // Delete time slot
  const handleDeleteTimeSlot = async (timeSlotId: string) => {
    if (window.confirm('Are you sure you want to delete this time slot?')) {
      try {
        console.log('Deleting time slot:', timeSlotId);
        
        // Add a small delay to ensure authentication is fully established
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
        setErrorMessage(err.message || 'Failed to delete time slot');
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
                    {groupedTimeSlots[dateStr].map((timeSlot) => {
                      // Calculate time slot segments based on service duration
                      const segments = [];
                      if (selectedService) {
                        const [startHours, startMinutes] = timeSlot.startTime.split(':').map(Number);
                        const [endHours, endMinutes] = timeSlot.endTime.split(':').map(Number);
                        const startTotalMinutes = startHours * 60 + startMinutes;
                        const endTotalMinutes = endHours * 60 + endMinutes;
                        const slotDuration = endTotalMinutes - startTotalMinutes;
                        
                        // Calculate number of segments based on service duration
                        const numSegments = Math.floor(slotDuration / selectedService.duration);
                        
                        for (let i = 0; i < numSegments; i++) {
                          const segmentStartMinutes = startTotalMinutes + (i * selectedService.duration);
                          const segmentEndMinutes = segmentStartMinutes + selectedService.duration;
                          
                          const segmentStartHours = Math.floor(segmentStartMinutes / 60);
                          const segmentStartMins = segmentStartMinutes % 60;
                          const segmentEndHours = Math.floor(segmentEndMinutes / 60);
                          const segmentEndMins = segmentEndMinutes % 60;
                          
                          const formattedSegmentStart = `${segmentStartHours.toString().padStart(2, '0')}:${segmentStartMins.toString().padStart(2, '0')}`;
                          const formattedSegmentEnd = `${segmentEndHours.toString().padStart(2, '0')}:${segmentEndMins.toString().padStart(2, '0')}`;
                          
                          segments.push({
                            start: formattedSegmentStart,
                            end: formattedSegmentEnd,
                            // For now, we'll consider the segment booked if the whole slot is booked
                            // In a real implementation, you'd track booking status per segment
                            isBooked: timeSlot.isBooked
                          });
                        }
                      }
                      
                      return (
                        <div 
                          key={timeSlot._id} 
                          className="p-3 border rounded-md border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium">
                              {formatTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
                            </div>
                            
                            {!timeSlot.isBooked && (
                              <button
                                onClick={() => handleDeleteTimeSlot(timeSlot._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            )}
                          </div>
                          
                          {/* Show segments */}
                          {segments.length > 0 && (
                            <div className="mt-2 border-t pt-2">
                              <p className="text-xs text-gray-500 mb-1">Segments ({selectedService?.duration} min each):</p>
                              <div className="grid grid-cols-1 gap-1">
                                {segments.map((segment, index) => (
                                  <div 
                                    key={index}
                                    className={`text-xs px-2 py-1 rounded-md ${
                                      segment.isBooked 
                                        ? 'bg-red-50 text-red-700' 
                                        : 'bg-green-50 text-green-700'
                                    }`}
                                  >
                                    {formatTime(segment.start)} - {formatTime(segment.end)}
                                    <span className="ml-1 font-medium">
                                      {segment.isBooked ? '(Booked)' : '(Available)'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
