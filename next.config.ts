import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'carecrew-1115.s3.ap-south-1.amazonaws.com',
      'caregiving-app-uploads.s3.us-east-1.amazonaws.com', // Default bucket from our config
      'caregiving-app-uploads.s3.amazonaws.com', // Alternative format without region
    ],
  },
};

export default nextConfig;
