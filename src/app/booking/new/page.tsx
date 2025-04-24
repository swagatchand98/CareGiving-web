'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/layout/AdminHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { Service, ServiceProvider } from '@/types/service';
import { Address } from '@/types/user';
import { BookingRequirements } from '@/types/booking';

// Mock data - in a real app, this would come from an API
const mockService: Service = {
  id: '1',
  categoryId: '1',
  name: 'Senior Home Care',
  description: 'Comprehensive care for seniors in the comfort of their own home.',
  shortDescription: 'In-home care for seniors',
  imageUrl: '/images/placeholders/elder-care.svg',
  duration: 120,
  basePrice: 50,
  isPopular: true,
  isActive: true,
  tags: ['senior', 'home care', 'elder'],
  requirements: ['Medical history', 'Emergency contact', 'Medication list', 'Dietary restrictions'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  category: {
    id: '1',
    name: 'Elder Care',
    description: 'Professional care services for seniors',
    icon: '/icons/elder-care.svg',
    imageUrl: '/images/placeholders/elder-care.svg',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
};

const mockProvider: ServiceProvider = {
  id: 'provider1',
  serviceId: '1',
  providerId: 'provider1',
  isAvailable: true,
  rating: 4.8,
  reviewCount: 56,
  provider: {
    id: 'provider1',
    name: 'Jane Smith',
    avatar: '/images/placeholders/caregiver.jpg.svg',
    bio: 'Experienced caregiver with 10+ years of experience working with seniors. Certified in CPR and First Aid.',
    experience: 10
  }
};

const mockAddresses: Address[] = [
  {
    id: 'address1',
    userId: 'user1',
    type: 'home',
    name: 'Home',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    isDefault: true,
    latitude: 40.7128,
    longitude: -74.0060
  },
  {
    id: 'address2',
    userId: 'user1',
    type: 'work',
    name: 'Office',
    addressLine1: '456 Park Ave',
    addressLine2: 'Floor 8',
    city: 'New York',
    state: 'NY',
    postalCode: '10022',
    country: 'USA',
    isDefault: false,
    latitude: 40.7580,
    longitude: -73.9855
  }
];

// Available time slots for the next 7 days
const generateTimeSlots = () => {
  const slots = [];
  const today = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dateString = date.toISOString().split('T')[0];
    const daySlots = [];
    
    // Generate slots from 8 AM to 8 PM
    for (let hour = 8; hour <= 20; hour++) {
      if (hour === 20) continue; // Skip 8 PM as starting time
      
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      
      daySlots.push({
        time: timeString,
        isAvailable
      });
    }
    
    slots.push({
      date: dateString,
      slots: daySlots
    });
  }
  
  return slots;
};

const mockTimeSlots = generateTimeSlots();

export default function BookingPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const serviceId = searchParams.get('serviceId');
  const providerId = searchParams.get('providerId');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [requirements, setRequirements] = useState<BookingRequirements>({
    specialInstructions: '',
    allergies: [],
    medicalConditions: [],
    preferences: {},
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch service and provider details
  useEffect(() => {
    if (serviceId && providerId) {
      // In a real app, these would be API calls
      setService(mockService);
      setProvider(mockProvider);
      setAddresses(mockAddresses);
      setTimeSlots(mockTimeSlots);
    } else {
      // If no serviceId or providerId, redirect to services page
      router.push('/services/browse');
    }
  }, [serviceId, providerId, router]);

  const handleRequirementsChange = (field: string, value: any) => {
    setRequirements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setRequirements(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact!,
        [field]: value
      }
    }));
  };

  const handleAddAllergy = (allergy: string) => {
    if (allergy.trim() && !requirements.allergies?.includes(allergy.trim())) {
      setRequirements(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergy.trim()]
      }));
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    setRequirements(prev => ({
      ...prev,
      allergies: prev.allergies?.filter(a => a !== allergy) || []
    }));
  };

  const handleAddMedicalCondition = (condition: string) => {
    if (condition.trim() && !requirements.medicalConditions?.includes(condition.trim())) {
      setRequirements(prev => ({
        ...prev,
        medicalConditions: [...(prev.medicalConditions || []), condition.trim()]
      }));
    }
  };

  const handleRemoveMedicalCondition = (condition: string) => {
    setRequirements(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions?.filter(c => c !== condition) || []
    }));
  };

  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!requirements.specialInstructions || !requirements.emergencyContact?.name || !requirements.emergencyContact?.phone) {
        alert('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!selectedDate || !selectedTime) {
        alert('Please select a date and time');
        return;
      }
    } else if (currentStep === 3) {
      if (!selectedAddress) {
        alert('Please select an address');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const handlePreviousStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmitBooking = async () => {
    if (!paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real app, this would be an API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random booking ID
      const generatedBookingId = `BK${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      setBookingId(generatedBookingId);
      setBookingComplete(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('There was an error processing your booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewBooking = () => {
    router.push(`/bookings/${bookingId}`);
  };

  // Show loading state
  if (isLoading || !user || !service || !provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Booking Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book a Service</h1>
          <p className="text-gray-600">Complete the following steps to book your service</p>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 1 ? 'bg-blue-500' : 'bg-gray-200'} rounded-l-full`}></div>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex-1">
              <div className={`h-2 ${currentStep >= 4 ? 'bg-blue-500' : 'bg-gray-200'} rounded-r-full`}></div>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <div className={`text-sm font-medium ${currentStep >= 1 ? 'text-blue-500' : 'text-gray-500'}`}>Requirements</div>
            <div className={`text-sm font-medium ${currentStep >= 2 ? 'text-blue-500' : 'text-gray-500'}`}>Schedule</div>
            <div className={`text-sm font-medium ${currentStep >= 3 ? 'text-blue-500' : 'text-gray-500'}`}>Address</div>
            <div className={`text-sm font-medium ${currentStep >= 4 ? 'text-blue-500' : 'text-gray-500'}`}>Payment</div>
          </div>
        </div>
        
        {/* Service Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start">
            <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
              <img 
                src={service.imageUrl || '/images/placeholders/service-default.svg'} 
                alt={service.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold mb-1">{service.name}</h2>
              <p className="text-gray-600 mb-2">{service.shortDescription}</p>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                  <img 
                    src={provider.provider?.avatar || '/images/placeholders/avatar-default.svg'} 
                    alt={provider.provider?.name || 'Provider'} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm text-gray-600">{provider.provider?.name}</span>
                <div className="ml-4 flex items-center">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="ml-1 text-sm">{provider.rating} ({provider.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-black">${service.basePrice}/hr</div>
              <div className="text-sm text-gray-600">{service.duration} minutes</div>
            </div>
          </div>
        </div>
        
        {bookingComplete ? (
          // Booking Complete
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your booking has been successfully created.</p>
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <p className="text-gray-700 mb-1">Booking ID: <span className="font-semibold">{bookingId}</span></p>
                <p className="text-gray-700 mb-1">Service: <span className="font-semibold">{service.name}</span></p>
                <p className="text-gray-700 mb-1">Date: <span className="font-semibold">{selectedDate} at {selectedTime}</span></p>
                <p className="text-gray-700">Caregiver: <span className="font-semibold">{provider.provider?.name}</span></p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={handleViewBooking}
                className="px-6 py-2"
              >
                View Booking Details
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="px-6 py-2"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          // Booking Steps
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Step 1: Requirements */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Service Requirements</h2>
                <p className="text-gray-600 mb-6">
                  Please provide the following information to help us provide the best care possible.
                </p>
                
                {/* Special Instructions */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Special Instructions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Please provide any special instructions or requirements for the caregiver"
                    value={requirements.specialInstructions || ''}
                    onChange={(e) => handleRequirementsChange('specialInstructions', e.target.value)}
                  ></textarea>
                </div>
                
                {/* Allergies */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Allergies</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="allergy-input"
                      className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add allergies (if any)"
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                      onClick={() => {
                        const input = document.getElementById('allergy-input') as HTMLInputElement;
                        handleAddAllergy(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {requirements.allergies && requirements.allergies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {requirements.allergies.map((allergy, index) => (
                        <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                          <span className="text-sm">{allergy}</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            onClick={() => handleRemoveAllergy(allergy)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Medical Conditions */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Medical Conditions</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="condition-input"
                      className="flex-grow px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add medical conditions (if any)"
                    />
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
                      onClick={() => {
                        const input = document.getElementById('condition-input') as HTMLInputElement;
                        handleAddMedicalCondition(input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {requirements.medicalConditions && requirements.medicalConditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {requirements.medicalConditions.map((condition, index) => (
                        <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                          <span className="text-sm">{condition}</span>
                          <button
                            type="button"
                            className="ml-2 text-gray-500 hover:text-gray-700"
                            onClick={() => handleRemoveMedicalCondition(condition)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Emergency Contact */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Emergency Contact <span className="text-red-500">*</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full name"
                        value={requirements.emergencyContact?.name || ''}
                        onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Phone number"
                        value={requirements.emergencyContact?.phone || ''}
                        onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-1">Relationship</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Relationship to patient"
                        value={requirements.emergencyContact?.relationship || ''}
                        onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Schedule */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
                <p className="text-gray-600 mb-6">
                  Choose a date and time that works for you.
                </p>
                
                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Select Date</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.date}
                        type="button"
                        className={`p-3 border rounded-lg text-center ${
                          selectedDate === slot.date
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedDate(slot.date);
                          setSelectedTime('');
                        }}
                      >
                        <div className="font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-sm">
                          {new Date(slot.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Time Selection */}
                {selectedDate && (
                  <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Select Time</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {timeSlots.find(slot => slot.date === selectedDate)?.slots.map((timeSlot: { time: string; isAvailable: boolean }, index: number) => (
                        <button
                          key={index}
                          type="button"
                          disabled={!timeSlot.isAvailable}
                          className={`p-3 border rounded-lg text-center ${
                            !timeSlot.isAvailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedTime === timeSlot.time
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'hover:bg-gray-50'
                          }`}
                          onClick={() => timeSlot.isAvailable && setSelectedTime(timeSlot.time)}
                        >
                          {timeSlot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Duration */}
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Service Duration</h3>
                    <p className="text-gray-600">
                      This service will take approximately {service.duration} minutes.
                    </p>
                    {selectedDate && selectedTime && (
                      <div className="mt-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Start:</span> {selectedTime} on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">End:</span> {(() => {
                            const [hours, minutes] = selectedTime.split(':').map(Number);
                            const endTime = new Date();
                            endTime.setHours(hours);
                            endTime.setMinutes(minutes);
                            endTime.setMinutes(endTime.getMinutes() + service.duration);
                            return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                          })()} on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Address */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Address</h2>
                <p className="text-gray-600 mb-6">
                  Choose the address where you would like to receive the service.
                </p>
                
                {/* Address Selection */}
                <div className="mb-6">
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddress === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => setSelectedAddress(address.id)}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{address.name}</h3>
                            <p className="text-gray-600">{address.type}</p>
                          </div>
                          {address.isDefault && (
                            <span className="text-sm font-medium bg-blue-100 text-blue-800 px-3 py-1 rounded-full h-fit">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-gray-700">{address.addressLine1}</p>
                          {address.addressLine2 && <p className="text-gray-700">{address.addressLine2}</p>}
                          <p className="text-gray-700">{address.city}, {address.state} {address.postalCode}</p>
                          <p className="text-gray-700">{address.country}</p>
                        </div>
                        {selectedAddress === address.id && (
                          <div className="mt-4 text-blue-600 font-medium">
                            <svg className="w-6 h-6 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                            </svg>
                            Selected
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add New Address */}
                <div className="mb-6">
                  <button
                    type="button"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                    onClick={() => {
                      // In a real app, this would open a modal to add a new address
                      alert('Add new address functionality would be implemented here');
                    }}
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Address
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 4: Payment */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment</h2>
                <p className="text-gray-600 mb-6">
                  Choose your payment method and review your booking details.
                </p>
                
                {/* Payment Methods */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <div className="space-y-3">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'credit_card'
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('credit_card')}
                    >
                      <div className="flex items-center">
                        <div className="mr-3">
                          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Credit / Debit Card</h4>
                          <p className="text-sm text-gray-600">Pay securely with your card</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-blue-600">
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.554 9.488c.121.563.106 1.246-.04 2.051-.582 2.978-2.477 4.466-5.683 4.466h-.442a.666.666 0 0 0-.444.166.72.72 0 0 0-.239.427l-.041.189-.553 3.479-.021.151a.706.706 0 0 1-.247.426.666.666 0 0 1-.447.166H8.874a.395.395 0 0 1-.331-.15.457.457 0 0 1-.09-.363c.061-.373.148-.938.267-1.689.117-.75.206-1.314.267-1.689s.15-.938.272-1.685c.121-.748.212-1.31.271-1.685.033-.248.179-.371.433-.371h1.316c.893.013 1.682-.057 2.375-.211a6.77 6.77 0 0 0 2.013-.752 5.87 5.87 0 0 0 1.534-1.248 5.43 5.43 0 0 0 .97-1.643c.032-.09.088-.15.166-.166a.33.33 0 0 1 .211.016c.09.033.15.086.166.166.128.603.19 1.1.19 1.496 0 .399-.039.793-.117 1.189zm-7.663-5.55c.272-.749.672-1.329 1.201-1.742a5.578 5.578 0 0 1 2.396-.986c.288-.046.715-.075 1.316-.075h.151c.894.015 1.682-.05 2.375-.196a6.489 6.489 0 0 0 2.004-.663 7.461 7.461 0 0 0 .507-.302c0-.06.008-.09.022-.09.015 0 .022.03.022.09.121.542.182 1.054.182 1.534 0 .486-.047.97-.143 1.453-.331 1.417-1.021 2.552-2.079 3.398s-2.248 1.268-3.568 1.268h-.341c-.243 0-.364.121-.364.371 0 .062-.008.156-.022.272a2.552 2.552 0 0 1-.052.272l-.916 5.795-.061.371c-.03.18-.121.33-.272.447a.722.722 0 0 1-.445.181H9.149a.384.384 0 0 1-.331-.166.43.43 0 0 1-.075-.347l2.147-13.647c.03-.18.121-.331.272-.448a.722.722 0 0 1 .445-.18h1.316c.894.015 1.683-.05 2.375-.196a6.489 6.489 0 0 0 2.004-.664 7.461 7.461 0 0 0 .507-.302c0-.06.008-.09.022-.09.015 0 .022.03.022.09.121.542.182 1.054.182 1.534 0 .486-.047.97-.143 1.453-.331 1.417-1.021 2.552-2.079 3.398s-2.248 1.268-3.568 1.268h-.341c-.243 0-.364.121-.364.371 0 .062-.008.156-.022.272a2.552 2.552 0 0 1-.052.272l-.916 5.795-.061.371c-.03.18-.121.33-.272.447a.722.722 0 0 1-.445.181H4.149a.384.384 0 0 1-.331-.166.43.43 0 0 1-.075-.347l2.147-13.647c.03-.18.121-.331.272-.448a.722.722 0 0 1 .445-.18h4.53c.197 0 .371.06.522.18.15.12.225.271.225.448l-.075.371c-.061.332-.106.623-.136.87-.03.249-.046.447-.046.597z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">PayPal</h4>
                          <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'cash'
                          ? 'border-blue-500 bg-blue-50'
                          : 'hover:border-gray-400'
                      }`}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="flex items-center">
                        <div className="mr-3 text-green-600">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium">Cash</h4>
                          <p className="text-sm text-gray-600">Pay in cash after service</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">{service.name}</span>
                      <span className="text-gray-700">${service.basePrice}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Duration</span>
                      <span className="text-gray-700">{service.duration} minutes</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Service Fee</span>
                      <span className="text-gray-700">$5.00</span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${service.basePrice + 5}</span>
                    </div>
                  </div>
                </div>
                
                {/* Booking Details */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Booking Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm">Date & Time</p>
                        <p className="font-medium">
                          {selectedDate && selectedTime ? (
                            <>
                              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                            </>
                          ) : (
                            'Not selected'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Caregiver</p>
                        <p className="font-medium">{provider.provider?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Address</p>
                        <p className="font-medium">
                          {selectedAddress ? (
                            addresses.find(a => a.id === selectedAddress)?.addressLine1
                          ) : (
                            'Not selected'
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Payment Method</p>
                        <p className="font-medium">
                          {paymentMethod === 'credit_card' && 'Credit / Debit Card'}
                          {paymentMethod === 'paypal' && 'PayPal'}
                          {paymentMethod === 'cash' && 'Cash'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-6">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 mr-2"
                      checked={true}
                      readOnly
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      By booking this service, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  className="px-6 py-2"
                >
                  Previous
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={handleNextStep}
                  className="px-6 py-2 ml-auto"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBooking}
                  className="px-6 py-2 ml-auto"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Confirm Booking'}
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
