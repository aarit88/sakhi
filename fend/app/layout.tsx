import type React from 'react';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { AiChatWidget } from '@/components/ai-chat-widget';
import { ServiceWorkerRegister } from '@/components/sw-register';
import { QuotaBanner } from '@/components/QuotaBanner';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'SAKHI',
  description: 'IoT-powered health tracking and smart wellness companion for women',
  openGraph: {
    title: 'SAKHI',
    description: 'IoT-powered health tracking and smart wellness companion for women',
  },
  applicationName: 'SAKHI',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SAKHI',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
        <AuthProvider>
          <QuotaBanner />
          <ServiceWorkerRegister />
          {children}
          <AiChatWidget />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #f9a8d4',
                padding: '12px 16px',
                color: '#db2777',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
