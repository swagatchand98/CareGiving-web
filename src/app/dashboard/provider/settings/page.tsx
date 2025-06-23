'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProviderHeader from '@/components/layout/ProviderHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import ConnectAccountSetup from '@/components/provider/ConnectAccountSetup';
import { TextField, Switch, FormControlLabel, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const ProviderSettingsPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    experience: '',
    qualifications: '',
    serviceTypes: [] as string[],
    hourlyRate: '',
    notificationPreferences: {
      email: true,
      sms: true,
      push: true,
      bookingRequests: true,
      paymentReceipts: true,
      serviceReminders: true
    },
    privacySettings: {
      showProfilePublicly: true,
      allowReviewsDisplay: true,
      shareContactInfo: false
    },
    paymentSettings: {
      paymentMethod: 'bank',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountHolderName: ''
    }
  });

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/dashboard/provider/settings');
      } else if (user?.role !== 'provider') {
        router.push('/dashboard');
      } else {
        // Populate form with user data when available
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
          experience: user.experience || '',
          qualifications: user.qualifications || '',
          serviceTypes: user.serviceType ? [user.serviceType] : [],
          hourlyRate: user.hourlyRate?.toString() || '',
          notificationPreferences: {
            email: true,
            sms: true,
            push: true,
            bookingRequests: true,
            paymentReceipts: true,
            serviceReminders: true
          },
          privacySettings: {
            showProfilePublicly: true,
            allowReviewsDisplay: true,
            shareContactInfo: false
          },
          paymentSettings: {
            paymentMethod: 'bank',
            bankName: '',
            accountNumber: '',
            routingNumber: '',
            accountHolderName: ''
          }
        });
        setIsLoading(false);
      }
    }
  }, [user, authLoading, router, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceTypesChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData(prev => ({
      ...prev,
      serviceTypes: e.target.value as string[]
    }));
  };

  const handleNotificationChange = (setting: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [setting]: e.target.checked
      }
    }));
  };

  const handlePrivacyChange = (setting: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: e.target.checked
      }
    }));
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFormData(prev => ({
      ...prev,
      paymentSettings: {
        ...prev.paymentSettings,
        paymentMethod: e.target.value as string
      }
    }));
  };

  const handlePaymentSettingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      paymentSettings: {
        ...prev.paymentSettings,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      // Use updateProfile from AuthContext
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        experience: formData.experience,
        qualifications: formData.qualifications,
        serviceType: formData.serviceTypes.length > 0 ? formData.serviceTypes[0] : undefined,
        hourlyRate: parseFloat(formData.hourlyRate)
      });
      
      setSuccessMessage('Settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
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
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Provider Settings</h1>
              <p className="text-gray-600">Manage your account preferences and settings</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/provider')}
              variant="outline"
              className="px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Settings Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {successMessage && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errorMessage}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </div>
                  <div>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextField
                      label="Email"
                      name="email"
                      value={formData.email}
                      disabled
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      helperText="Email cannot be changed"
                    />
                  </div>
                  <div>
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
                <div>
                  <TextField
                    label="Bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={4}
                    placeholder="Tell clients about yourself and your caregiving approach"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <TextField
                      label="Experience (years)"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </div>
                  <div>
                    <TextField
                      label="Hourly Rate ($)"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </div>
                </div>
                
                <div>
                  <TextField
                    label="Qualifications & Certifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={2}
                    placeholder="List your relevant qualifications, certifications, and training"
                  />
                </div>
                
                <div className="mt-4">
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="service-types-label">Service Types</InputLabel>
                    <Select
                      labelId="service-types-label"
                      id="service-types"
                      multiple
                      value={formData.serviceTypes}
                      onChange={handleServiceTypesChange as any}
                      label="Service Types"
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      <MenuItem value="elderly-care">Elderly Care</MenuItem>
                      <MenuItem value="child-care">Child Care</MenuItem>
                      <MenuItem value="special-needs">Special Needs Care</MenuItem>
                      <MenuItem value="medical-care">Medical Care</MenuItem>
                      <MenuItem value="companion-care">Companion Care</MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
              
              {/* Notification Preferences */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="space-y-2">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificationPreferences.email}
                        onChange={handleNotificationChange('email')}
                        color="primary"
                      />
                    }
                    label="Email Notifications"
                  />
                  <p className="text-sm text-gray-500 ml-9">Receive booking updates and reminders via email</p>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificationPreferences.sms}
                        onChange={handleNotificationChange('sms')}
                        color="primary"
                      />
                    }
                    label="SMS Notifications"
                  />
                  <p className="text-sm text-gray-500 ml-9">Receive booking updates and reminders via text message</p>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.notificationPreferences.push}
                        onChange={handleNotificationChange('push')}
                        color="primary"
                      />
                    }
                    label="Push Notifications"
                  />
                  <p className="text-sm text-gray-500 ml-9">Receive push notifications on your device</p>
                  
                  <div className="mt-4 border-t pt-4">
                    <p className="font-medium mb-2">Notify me about:</p>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notificationPreferences.bookingRequests}
                          onChange={handleNotificationChange('bookingRequests')}
                          color="primary"
                        />
                      }
                      label="New Booking Requests"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notificationPreferences.paymentReceipts}
                          onChange={handleNotificationChange('paymentReceipts')}
                          color="primary"
                        />
                      }
                      label="Payment Receipts"
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.notificationPreferences.serviceReminders}
                          onChange={handleNotificationChange('serviceReminders')}
                          color="primary"
                        />
                      }
                      label="Service Reminders"
                    />
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                <div className="space-y-2">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.showProfilePublicly}
                        onChange={handlePrivacyChange('showProfilePublicly')}
                        color="primary"
                      />
                    }
                    label="Show My Profile Publicly"
                  />
                  <p className="text-sm text-gray-500 ml-9">Allow your profile to be visible in search results</p>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.allowReviewsDisplay}
                        onChange={handlePrivacyChange('allowReviewsDisplay')}
                        color="primary"
                      />
                    }
                    label="Display Client Reviews"
                  />
                  <p className="text-sm text-gray-500 ml-9">Allow client reviews to be displayed on your profile</p>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.shareContactInfo}
                        onChange={handlePrivacyChange('shareContactInfo')}
                        color="primary"
                      />
                    }
                    label="Share Contact Information"
                  />
                  <p className="text-sm text-gray-500 ml-9">Allow clients to see your contact information before booking</p>
                </div>
              </div>
              
              {/* Payment Settings */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Payment Settings</h2>
                
                {/* Stripe Connect Account Setup */}
                <div className="mb-6">
                  <ConnectAccountSetup />
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Legacy Payment Methods</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    These payment methods are being phased out in favor of Stripe Connect.
                    We recommend setting up your Stripe Connect account above.
                  </p>
                  
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      id="payment-method"
                      value={formData.paymentSettings.paymentMethod}
                      onChange={handlePaymentMethodChange as any}
                      label="Payment Method"
                    >
                      <MenuItem value="bank">Direct Bank Deposit</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="venmo">Venmo</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                
                {formData.paymentSettings.paymentMethod === 'bank' && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-3">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <TextField
                          label="Bank Name"
                          name="bankName"
                          value={formData.paymentSettings.bankName}
                          onChange={handlePaymentSettingChange}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      </div>
                      <div>
                        <TextField
                          label="Account Holder Name"
                          name="accountHolderName"
                          value={formData.paymentSettings.accountHolderName}
                          onChange={handlePaymentSettingChange}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <TextField
                          label="Account Number"
                          name="accountNumber"
                          value={formData.paymentSettings.accountNumber}
                          onChange={handlePaymentSettingChange}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                          type="password"
                        />
                      </div>
                      <div>
                        <TextField
                          label="Routing Number"
                          name="routingNumber"
                          value={formData.paymentSettings.routingNumber}
                          onChange={handlePaymentSettingChange}
                          fullWidth
                          variant="outlined"
                          margin="normal"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {formData.paymentSettings.paymentMethod === 'paypal' && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-3">PayPal Details</h3>
                    <TextField
                      label="PayPal Email"
                      name="paypalEmail"
                      value={formData.email}
                      fullWidth
                      variant="outlined"
                      margin="normal"
                      helperText="We'll use your account email for PayPal payments"
                    />
                  </div>
                )}
                
                {formData.paymentSettings.paymentMethod === 'venmo' && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md">
                    <h3 className="font-medium mb-3">Venmo Details</h3>
                    <TextField
                      label="Venmo Username"
                      name="venmoUsername"
                      placeholder="@username"
                      fullWidth
                      variant="outlined"
                      margin="normal"
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Danger Zone */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500">
            <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
            <p className="text-gray-600 mb-4">These actions are irreversible. Please proceed with caution.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all your services? This action cannot be undone.')) {
                    // Handle delete services
                  }
                }}
              >
                Delete All Services
              </Button>
              
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm('Are you sure you want to deactivate your provider account? You can reactivate it later by contacting support.')) {
                    // Handle account deactivation
                  }
                }}
              >
                Deactivate Provider Account
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProviderSettingsPage;
