import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Caregiving Web Application',
  description: 'A platform for caregiving services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
