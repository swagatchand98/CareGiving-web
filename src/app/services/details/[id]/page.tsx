import { use } from 'react';
import ServiceDetailsClient from './ServiceDetailsClient';

interface ServiceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  const resolvedParams = use(params);
  return <ServiceDetailsClient serviceId={resolvedParams.id} />;
}
