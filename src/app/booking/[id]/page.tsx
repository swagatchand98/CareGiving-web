import React from 'react';
import BookingDetailsClient from './BookingDetailsClient';

interface BookingDetailsPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailsPage({ params }: BookingDetailsPageProps) {
  return <BookingDetailsClient bookingId={params.id} />;
}
