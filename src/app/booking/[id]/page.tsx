import { use } from 'react';
import BookingDetailsClient from './BookingDetailsClient';

interface BookingDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  const resolvedParams = use(params);
  return <BookingDetailsClient bookingId={resolvedParams.id} />;
}
