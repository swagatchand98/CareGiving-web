import axios from '../lib/axios';

export interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
  monthlyEarnings: MonthlyEarning[];
}

export interface MonthlyEarning {
  month: string;
  amount: number;
}

export interface EarningsHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  service: string;
  client: string;
  bookingId: string;
}

export interface EarningsHistoryResponse {
  earnings: EarningsHistoryItem[];
  totalCount: number;
}

export interface EarningsFilters {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  serviceType?: string;
  page?: number;
  limit?: number;
}

/**
 * Get provider earnings summary
 * @returns Provider earnings summary
 */
export const getEarningsSummary = async (): Promise<EarningsSummary> => {
  try {
    const response = await axios.get<{data: EarningsSummary}>('/providers/earnings/summary');
    return response.data.data;
  } catch (error) {
    console.error('Error getting earnings summary:', error);
    throw error;
  }
};

/**
 * Get provider earnings history with optional filters
 * @param filters - Optional filters for earnings history
 * @returns Provider earnings history
 */
export const getEarningsHistory = async (filters?: EarningsFilters): Promise<EarningsHistoryResponse> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toISOString());
    }
    
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toISOString());
    }
    
    if (filters?.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters?.serviceType && filters.serviceType !== 'all') {
      params.append('serviceType', filters.serviceType);
    }
    
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    
    const queryString = params.toString();
    const url = `/providers/earnings/history${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get<{data: EarningsHistoryResponse}>(url);
    return response.data.data;
  } catch (error) {
    console.error('Error getting earnings history:', error);
    throw error;
  }
};

/**
 * Transform payment history data into earnings history format
 * This is a utility function to convert the payment history data from the API
 * into the format expected by the earnings page
 */
export const transformPaymentHistoryToEarnings = (payments: any[]): EarningsHistoryItem[] => {
  return payments
    .filter(payment => {
      // Only include payments for completed bookings
      const bookingDetails = payment.bookingId || {};
      const isBookingCompleted = bookingDetails.status === 'completed';
      
      // Only include completed bookings and refunds for completed bookings
      return isBookingCompleted && (
        (payment.type === 'BOOKING' && payment.status === 'COMPLETED') || 
        payment.type === 'REFUND'
      );
    })
    .map(payment => {
      const isRefund = payment.type === 'REFUND';
      const bookingDetails = payment.bookingId || {};
      const clientDetails = payment.userId || {};
      
      return {
        id: payment._id,
        date: payment.createdAt,
        amount: payment.providerAmount || payment.amount, // Use provider amount if available
        status: isRefund ? 'refunded' : 'paid',
        service: bookingDetails.serviceId?.name || 'Service',
        client: `${clientDetails.firstName || ''} ${clientDetails.lastName || ''}`.trim() || 'Client',
        bookingId: bookingDetails._id || ''
      };
    });
};

/**
 * Calculate monthly earnings from payment history
 * This is a utility function to calculate monthly earnings from payment history
 */
export const calculateMonthlyEarnings = (payments: any[]): MonthlyEarning[] => {
  const monthlyMap = new Map<string, number>();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize with zero for the last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = months[month.getMonth()];
    monthlyMap.set(monthKey, 0);
  }
  
  // Calculate earnings for each month
  payments.forEach(payment => {
    // Only include payments for completed bookings
    const bookingDetails = payment.bookingId || {};
    const isBookingCompleted = bookingDetails.status === 'completed';
    
    if (isBookingCompleted && payment.type === 'BOOKING' && payment.status === 'COMPLETED') {
      const date = new Date(payment.createdAt);
      const monthKey = months[date.getMonth()];
      
      // Only include payments from the last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (date >= sixMonthsAgo && monthlyMap.has(monthKey)) {
        const currentAmount = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, currentAmount + (payment.providerAmount || payment.amount));
      }
    }
  });
  
  // Convert map to array
  return Array.from(monthlyMap.entries())
    .map(([month, amount]) => ({ month, amount }));
};
