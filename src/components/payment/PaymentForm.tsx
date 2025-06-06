'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPaymentIntent, confirmPayment } from '@/services/paymentService';
import Button from '../common/Button';
import Input from '../common/Input';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  bookingId, 
  amount, 
  onSuccess, 
  onError 
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Field validation states
  const [fieldErrors, setFieldErrors] = useState({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });
  
  // Field touched states to show validation only after user interaction
  const [touched, setTouched] = useState({
    nameOnCard: false,
    cardNumber: false,
    expiryDate: false,
    cvc: false
  });
  
  // Payment processing states
  const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'verifying'>('input');

  const validateCardNumber = (number: string): boolean => {
    // Remove spaces
    const cleanNumber = number.replace(/\s/g, '');
    // Check if it's a valid length (most cards are 16 digits)
    return cleanNumber.length === 16 && /^\d+$/.test(cleanNumber);
  };

  const validateExpiryDate = (expiry: string): boolean => {
    // Check format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return false;
    }

    const [month, year] = expiry.split('/').map(part => parseInt(part, 10));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Check if date is valid
    if (month < 1 || month > 12) {
      return false;
    }

    // Check if card is expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }

    return true;
  };

  const validateCVC = (cvc: string): boolean => {
    // Most CVC are 3 digits, some Amex are 4
    return /^\d{3,4}$/.test(cvc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPaymentStep('processing');

    try {
      // Validate form fields
      if (!nameOnCard.trim()) {
        setError('Please enter the name on your card');
        setIsLoading(false);
        setPaymentStep('input');
        return;
      }

      if (!validateCardNumber(cardNumber)) {
        setError('Please enter a valid card number');
        setIsLoading(false);
        setPaymentStep('input');
        return;
      }

      if (!validateExpiryDate(expiryDate)) {
        setError('Please enter a valid expiry date (MM/YY) that is not expired');
        setIsLoading(false);
        setPaymentStep('input');
        return;
      }

      if (!validateCVC(cvc)) {
        setError('Please enter a valid CVC code (3 or 4 digits)');
        setIsLoading(false);
        setPaymentStep('input');
        return;
      }

      try {
        // Create payment intent
        const { clientSecret, paymentId } = await createPaymentIntent(bookingId);
        
        // In a real implementation, we would use Stripe Elements to handle the payment
        // For this demo, we'll just simulate a successful payment
        console.log('Payment intent created:', { clientSecret, paymentId });
        
        // Extract the payment intent ID from the client secret
        // Client secret format is: pi_XXX_secret_YYY
        const paymentIntentId = clientSecret.split('_secret_')[0];
        console.log('Extracted payment intent ID:', paymentIntentId);
        
        // Update payment step to verifying
        setPaymentStep('verifying');
        
        try {
          // Confirm payment with the Stripe payment intent ID
          await confirmPayment(paymentIntentId);
          
          // Handle success
          setIsLoading(false);
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/booking/${bookingId}`);
          }
        } catch (paymentError: any) {
          // Handle payment confirmation errors specifically
          console.error('Payment confirmation error:', paymentError);
          setError(paymentError.message || 'Your payment could not be processed. Please try again or use a different payment method.');
          setIsLoading(false);
          setPaymentStep('input');
          if (onError) {
            onError(paymentError);
          }
        }
      } catch (err: any) {
        // Handle payment intent creation errors
        console.error('Payment intent creation error:', err);
        
        // Provide more specific error messages based on error type
        if (err.response?.status === 400) {
          setError('Invalid payment request. Please check your details and try again.');
        } else if (err.response?.status === 401) {
          setError('Authentication error. Please log in again.');
          // Redirect to login after a delay
          setTimeout(() => router.push('/auth/login'), 3000);
        } else if (err.response?.status === 403) {
          setError('You are not authorized to make this payment.');
        } else if (err.response?.status === 404) {
          setError('The booking was not found. It may have been cancelled or deleted.');
        } else if (err.message?.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(err.message || 'An unexpected error occurred during payment processing. Please try again later.');
        }
        
        setIsLoading(false);
        setPaymentStep('input');
        if (onError) {
          onError(err);
        }
      }
    } catch (err: any) {
      // Handle any other unexpected errors
      console.error('Unexpected payment error:', err);
      setError('An unexpected error occurred. Please try again later.');
      setIsLoading(false);
      setPaymentStep('input');
      if (onError) {
        onError(err);
      }
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add spaces after every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    // Remove non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    } else {
      return digits;
    }
  };

  // Validate fields as user types
  useEffect(() => {
    if (touched.nameOnCard) {
      setFieldErrors(prev => ({
        ...prev,
        nameOnCard: nameOnCard.trim() ? '' : 'Name on card is required'
      }));
    }
    
    if (touched.cardNumber) {
      setFieldErrors(prev => ({
        ...prev,
        cardNumber: validateCardNumber(cardNumber) ? '' : 'Please enter a valid 16-digit card number'
      }));
    }
    
    if (touched.expiryDate) {
      setFieldErrors(prev => ({
        ...prev,
        expiryDate: validateExpiryDate(expiryDate) ? '' : 'Please enter a valid expiry date (MM/YY)'
      }));
    }
    
    if (touched.cvc) {
      setFieldErrors(prev => ({
        ...prev,
        cvc: validateCVC(cvc) ? '' : 'Please enter a valid 3 or 4 digit CVC'
      }));
    }
  }, [nameOnCard, cardNumber, expiryDate, cvc, touched]);
  
  // Mark field as touched when user interacts with it
  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };
  
  // Check if form is valid
  const isFormValid = () => {
    return (
      nameOnCard.trim() !== '' &&
      validateCardNumber(cardNumber) &&
      validateExpiryDate(expiryDate) &&
      validateCVC(cvc)
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Payment Details</h2>
      <p className="mb-4">Amount: ${(amount / 100).toFixed(2)}</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {paymentStep === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <p>Creating payment intent...</p>
        </div>
      )}
      
      {paymentStep === 'verifying' && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-3"></div>
          <p>Verifying payment details...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Input
            label="Name on Card"
            value={nameOnCard}
            onChange={(e) => setNameOnCard(e.target.value)}
            onBlur={() => handleBlur('nameOnCard')}
            placeholder="John Doe"
            required
            error={touched.nameOnCard ? fieldErrors.nameOnCard : ''}
            className={touched.nameOnCard && !fieldErrors.nameOnCard ? 'border-green-500' : ''}
          />
        </div>
        
        <div className="mb-4">
          <Input
            label="Card Number"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => handleBlur('cardNumber')}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            error={touched.cardNumber ? fieldErrors.cardNumber : ''}
            className={touched.cardNumber && !fieldErrors.cardNumber ? 'border-green-500' : ''}
          />
          {touched.cardNumber && !fieldErrors.cardNumber && (
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Valid card number
            </div>
          )}
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <Input
              label="Expiry Date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              onBlur={() => handleBlur('expiryDate')}
              placeholder="MM/YY"
              maxLength={5}
              required
              error={touched.expiryDate ? fieldErrors.expiryDate : ''}
              className={touched.expiryDate && !fieldErrors.expiryDate ? 'border-green-500' : ''}
            />
          </div>
          <div className="w-1/2">
            <Input
              label="CVC"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              onBlur={() => handleBlur('cvc')}
              placeholder="123"
              maxLength={3}
              required
              error={touched.cvc ? fieldErrors.cvc : ''}
              className={touched.cvc && !fieldErrors.cvc ? 'border-green-500' : ''}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your payment information is secure and encrypted
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)} Now`}
        </Button>
        
        {!isFormValid() && touched.cardNumber && touched.expiryDate && touched.cvc && touched.nameOnCard && (
          <p className="text-sm text-red-600 mt-2">
            Please fix the errors above to continue
          </p>
        )}
      </form>
    </div>
  );
};

export default PaymentForm;
