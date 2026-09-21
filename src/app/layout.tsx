import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F0F4FA',
};

export const metadata: Metadata = {
  title: 'BAALANCE | "Your hair keeps the receipts." — 90-Day Hair Cortisol Diagnostics',
  description: 'Clinical-grade 90-day hair cortisol analysis correlating segmented ELISA lab values with Google Calendar workloads and chronobiology. Your hair keeps the receipts.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F0F4FA] text-[#000000] antialiased selection:bg-[#3186FF] selection:text-white">
        {children}
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      </body>
    </html>
  );
}
