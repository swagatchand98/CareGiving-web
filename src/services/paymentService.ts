import axios from '../lib/axios';

// Define response types
interface PaymentIntentResponse {
  clientSecret: string;
  paymentId: string;
}

interface PaymentResponse {
  payment: any;
}

interface RefundResponse {
  refund: any;
  refundAmount: number;
}

interface PaymentHistoryResponse {
  payments: any[];
}

interface BookingPaymentDetailsResponse {
  payments: any[];
}

/**
 * Create a payment intent for a booking
 * @param bookingId - Booking ID
 * @returns Client secret and payment ID
 */
export const createPaymentIntent = async (bookingId: string): Promise<PaymentIntentResponse> => {
  try {
    const response = await axios.post<{data: PaymentIntentResponse}>('/payments/create-intent', { bookingId });
    console.log('Payment intent created:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm a payment
 * @param paymentIntentId - Payment intent ID from Stripe
 * @returns Payment details
 */
export const confirmPayment = async (paymentIntentId: string): Promise<PaymentResponse> => {
  try {
    console.log('Confirming payment with intent ID:', paymentIntentId);
    const response = await axios.post<{data: PaymentResponse}>('/payments/confirm', { paymentIntentId });
    console.log('Payment confirmed:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Process a refund for a booking
 * @param bookingId - Booking ID
 * @param reason - Refund reason
 * @returns Refund details
 */
export const processRefund = async (bookingId: string, reason: string): Promise<RefundResponse> => {
  try {
    const response = await axios.post<{data: RefundResponse}>('/payments/refund', { bookingId, reason });
    return response.data.data;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Get payment history
 * @returns Payment history
 */
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse> => {
  try {
    const response = await axios.get<{data: PaymentHistoryResponse}>('/payments/history');
    return response.data.data;
  } catch (error) {
    console.error('Error getting payment history:', error);
    throw error;
  }
};

/**
 * Get payment details for a booking
 * @param bookingId - Booking ID
 * @returns Payment details
 */
export const getBookingPaymentDetails = async (bookingId: string): Promise<BookingPaymentDetailsResponse> => {
  try {
    const response = await axios.get<{data: BookingPaymentDetailsResponse}>(`/payments/booking/${bookingId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting booking payment details:', error);
    throw error;
  }
};
