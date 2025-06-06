import React from 'react';
import ChatClient from './ChatClient';

interface ChatPageProps {
  params: {
    bookingId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  return <ChatClient bookingId={params.bookingId} />;
}
