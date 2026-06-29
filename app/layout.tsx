import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CallMissed AI Assistant',
  description: 'A premium, production-ready AI conversational assistant workspace powered by CallMissed.',
  keywords: ['AI Chatbot', 'NextJS Chat', 'CallMissed', 'Kimi Code', 'Flux Image Generator'],
  authors: [{ name: 'CallMissed Team' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
