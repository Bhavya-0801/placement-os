import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: 'PlacementOS — The Operating System for Placement Season',
  description: 'Placement Ka Pressure™ — turned into a system. Track applications, analyze resumes, practice interviews, and discover your placement readiness.',
  keywords: 'placement, campus recruitment, resume, interview, job applications, BTech, engineering placement',
  openGraph: {
    title: 'PlacementOS',
    description: 'From "Please Hire Me" to "Offer Received."',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
