import axios from '@/lib/axios';

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

/**
 * Get provider's Stripe Connect account details
 * @returns Provider's Stripe Connect account details
 */
export const getConnectAccount = async (): Promise<ApiResponse<ConnectAccountDetails>> => {
  try {
    console.log('Fetching connect account details...');
    const response = await axios.get<ApiResponse<ConnectAccountDetails>>('/providers/connect/account');
    console.log('Connect account response:', response.data);
    return response.data;
  } catch (error: any) {
    // Only log the error if it's not a 404 (not found) error
    // 404 is expected for new providers who haven't set up their Connect account yet
    if (error.response?.status !== 404) {
      console.error('Error fetching connect account:', error);
    } else {
      console.log('No Connect account found. Provider needs to set up their account.');
    }
    throw error;
  }
};

/**
 * Create a Stripe Connect account link for onboarding
 * @returns URL to redirect the provider to for onboarding
 */
export const createAccountLink = async (): Promise<ApiResponse<{ url: string }>> => {
  try {
    console.log('Creating account link...');
    const response = await axios.post<ApiResponse<{ url: string }>>('/providers/connect/create-account-link');
    console.log('Account link response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating account link:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Create a Stripe Connect login link for existing accounts
 * @returns URL to redirect the provider to for login
 */
export const createLoginLink = async (): Promise<ApiResponse<{ url: string }>> => {
  try {
    const response = await axios.post<ApiResponse<{ url: string }>>('/providers/connect/login-link');
    return response.data;
  } catch (error: any) {
    console.error('Error creating login link:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Update provider's payout schedule
 * @param payoutSchedule - Payout schedule ('manual', 'daily', 'weekly', 'monthly')
 * @returns Updated payout schedule
 */
export const updatePayoutSchedule = async (payoutSchedule: 'manual' | 'daily' | 'weekly' | 'monthly') => {
  try {
    const response = await axios.patch('/providers/connect/payout-schedule', {
      payoutSchedule
    });
    return response.data;
  } catch (error: any) {
    console.error('Error updating payout schedule:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Request an immediate payout
 * @param amount - Amount to payout
 * @returns Payout details
 */
export const requestPayout = async (amount: number) => {
  try {
    const response = await axios.post('/providers/connect/request-payout', {
      amount
    });
    return response.data;
  } catch (error: any) {
    console.error('Error requesting payout:', error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * Get provider's Stripe balance
 * @returns Provider's Stripe balance
 */
export const getBalance = async () => {
  try {
    const response = await axios.get('/providers/connect/balance');
    return response.data;
  } catch (error: any) {
    // Only log the error if it's not a 404 (not found) error
    if (error.response?.status !== 404) {
      console.error('Error fetching balance:', error.response?.data?.message || error.message);
    } else {
      console.log('No Connect account found for balance check.');
    }
    throw error;
  }
};

/**
 * Get provider's payout history
 * @returns Provider's payout history
 */
export const getPayouts = async () => {
  try {
    const response = await axios.get('/providers/connect/payouts');
    return response.data;
  } catch (error: any) {
    // Only log the error if it's not a 404 (not found) error
    if (error.response?.status !== 404) {
      console.error('Error fetching payouts:', error.response?.data?.message || error.message);
    } else {
      console.log('No Connect account found for payouts check.');
    }
    throw error;
  }
};
