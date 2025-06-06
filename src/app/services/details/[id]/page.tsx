import React from 'react';
import ServiceDetailsClient from './ServiceDetailsClient';

interface ServiceDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  return <ServiceDetailsClient serviceId={params.id} />;
}
