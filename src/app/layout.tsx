import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Elijah AI — Autonomous Operations Platform',
  description: 'AI Workforce for Trade & Field Service Companies.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen bg-background text-slate-100 font-sans antialiased selection:bg-primary selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

