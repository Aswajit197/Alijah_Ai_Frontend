import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 antialiased selection:bg-primary selection:text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

