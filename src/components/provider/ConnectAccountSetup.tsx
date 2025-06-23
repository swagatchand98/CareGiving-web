import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import axios from '@/lib/axios';
import * as providerConnectService from '@/services/providerConnectService';

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface ConnectAccountDetails {
  id: string;
  stripeConnectAccountId: string;
  payoutEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  payoutSchedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  defaultPayoutMethod?: string;
  createdAt: string;
}

const ConnectAccountSetup: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [accountDetails, setAccountDetails] = useState<ConnectAccountDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setIsLoading(true);
      const response = await providerConnectService.getConnectAccount();
      setAccountDetails(response.data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No account found, which is expected for new providers
        setAccountDetails(null);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch account details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      const response = await providerConnectService.createAccountLink();
      window.location.href = response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account link');
      setIsLoading(false);
    }
  };

  const handleLoginToStripe = async () => {
    try {
      setIsLoading(true);
      const response = await providerConnectService.createLoginLink();
      window.location.href = response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create login link');
      setIsLoading(false);
    }
  };

  const handleUpdatePayoutSchedule = async (schedule: string) => {
    try {
      setIsLoading(true);
      await providerConnectService.updatePayoutSchedule(schedule as 'manual' | 'daily' | 'weekly' | 'monthly');
      await fetchAccountDetails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update payout schedule');
      setIsLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    try {
      setIsLoading(true);
      // Get available balance first
      interface EarningsSummary {
        totalEarnings: number;
        pendingPayouts: number;
        completedBookings: number;
        monthlyEarnings: Array<{ month: string; amount: number }>;
      }
      
      const earningsResponse = await axios.get<ApiResponse<EarningsSummary>>('/providers/earnings/summary');
      const availableBalance = earningsResponse.data.data.pendingPayouts;
      
      if (availableBalance <= 0) {
        setError('No funds available for payout');
        setIsLoading(false);
        return;
      }
      
      // Request payout
      await providerConnectService.requestPayout(availableBalance);
      
      // Show success message
      alert(`Payout of $${availableBalance.toFixed(2)} requested successfully. It will be processed within 2-3 business days.`);
      
      setIsLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request payout');
      setIsLoading(false);
    }
  };

  if (isLoading && !accountDetails) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Stripe Connect Account</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {!accountDetails ? (
        <div>
          <p className="mb-4">
            To receive payments, you need to set up your Stripe Connect account. This will allow you to receive payments directly to your bank account.
          </p>
          <Button onClick={handleCreateAccount} disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Set Up Stripe Connect Account'}
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Account Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Created</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Details Submitted</span>
                  <span className={`font-medium ${accountDetails.detailsSubmitted ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accountDetails.detailsSubmitted ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payouts Enabled</span>
                  <span className={`font-medium ${accountDetails.payoutEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accountDetails.payoutEnabled ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-2">Payout Schedule</h3>
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Current Schedule</span>
                  <span className="font-medium">
                    {accountDetails.payoutSchedule.charAt(0).toUpperCase() + accountDetails.payoutSchedule.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Change Schedule</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    value={accountDetails.payoutSchedule}
                    onChange={(e) => handleUpdatePayoutSchedule(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="manual">Manual (Request payout)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {!accountDetails.detailsSubmitted && (
              <Button onClick={handleCreateAccount} disabled={isLoading}>
                Complete Account Setup
              </Button>
            )}
            
            {accountDetails.payoutEnabled && accountDetails.payoutSchedule === 'manual' && (
              <Button onClick={handleRequestPayout} disabled={isLoading}>
                Request Payout
              </Button>
            )}
            
            <Button onClick={handleLoginToStripe} variant="outline" disabled={isLoading}>
              Manage Stripe Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectAccountSetup;
