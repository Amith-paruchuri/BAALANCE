import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { HelpPanelHost } from '@/components/HelpPanelHost';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F6F2EC',
};

export const metadata: Metadata = {
  title: 'BAALANCE | Your next stress test is a haircut',
  description: 'BAALANCE measures three months of stress from a small lock of hair, then uses your calendar to explain what caused it. Hair keeps the receipts. Research stage, not a diagnosis.',
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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F6F2EC] text-slate-900 font-sans antialiased selection:bg-[#0D4F59] selection:text-white">
        {children}
        <HelpPanelHost />
      </body>
    </html>
  );
}
