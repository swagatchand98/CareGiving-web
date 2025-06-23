import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { AuthProvider } from '@/contexts/AuthContext';
import { SplashScreenProvider } from '@/contexts/SplashScreenContext';
import GoogleMapsScript from '@/components/common/GoogleMapsScript';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

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
    <html lang="en" className={poppins.variable}>
      <body>
        <AuthProvider>
          <SplashScreenProvider>
            <GoogleMapsScript>
              {children}
            </GoogleMapsScript>
          </SplashScreenProvider>
        </AuthProvider>
        
        {/* Offline detection script */}
        <Script 
          src="/offline-detection.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
