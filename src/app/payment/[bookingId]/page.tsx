import React from 'react';
import PaymentClient from './PaymentClient';

interface PaymentPageProps {
  params: {
    bookingId: string;
  };
}

export default function PaymentPage({ params }: PaymentPageProps) {
  return <PaymentClient bookingId={params.bookingId} />;
}
