import { use } from 'react';
import PaymentClient from './PaymentClient';

interface PaymentPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function PaymentPage({ params }: PaymentPageProps) {
  const resolvedParams = use(params);
  return <PaymentClient bookingId={resolvedParams.bookingId} />;
}
