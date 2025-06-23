'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedHeader from '@/components/layout/EnhancedHeader';
import Footer from '@/components/layout/Footer';
import Button from '@/components/common/Button';
import { TextField, Switch, FormControlLabel } from '@mui/material';

const UserSettingsPage: React.FC = () => {
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
    notificationPreferences: {
      email: true,
      sms: true,
      push: true
    },
    privacySettings: {
      shareProfileWithProviders: true,
      allowReviewsDisplay: true
    }
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/dashboard/user/settings');
      return;
    }

    // Populate form with user data when available
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        notificationPreferences: {
          email: true,
          sms: true,
          push: true
        },
        privacySettings: {
          shareProfileWithProviders: true,
          allowReviewsDisplay: true
        }
      });
      setIsLoading(false);
    }
  }, [user, authLoading, router, isAuthenticated]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
        phoneNumber: formData.phoneNumber
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
      <EnhancedHeader user={user} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your account preferences and settings</p>
            </div>
            <Button 
              onClick={() => router.push('/dashboard/user')}
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
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                <div className="space-y-2">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.shareProfileWithProviders}
                        onChange={handlePrivacyChange('shareProfileWithProviders')}
                        color="primary"
                      />
                    }
                    label="Share Profile with Service Providers"
                  />
                  <p className="text-sm text-gray-500 ml-9">Allow service providers to see your profile information</p>
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.privacySettings.allowReviewsDisplay}
                        onChange={handlePrivacyChange('allowReviewsDisplay')}
                        color="primary"
                      />
                    }
                    label="Display My Reviews Publicly"
                  />
                  <p className="text-sm text-gray-500 ml-9">Allow your reviews to be displayed publicly on provider profiles</p>
                </div>
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
                  if (window.confirm('Are you sure you want to delete all your payment methods? This action cannot be undone.')) {
                    // Handle delete payment methods
                  }
                }}
              >
                Delete Payment Methods
              </Button>
              
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm('Are you sure you want to deactivate your account? You can reactivate it later by logging in.')) {
                    // Handle account deactivation
                  }
                }}
              >
                Deactivate Account
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserSettingsPage;
