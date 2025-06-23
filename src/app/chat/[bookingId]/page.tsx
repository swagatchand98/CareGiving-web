import { use } from 'react';
import ChatClient from './ChatClient';

interface ChatPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const resolvedParams = use(params);
  return <ChatClient bookingId={resolvedParams.bookingId} />;
}
