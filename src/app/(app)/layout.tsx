import type { Metadata } from 'next';
import AppShell from '@/components/layout/app-shell';
import { AppProvider } from '@/lib/context';

export const metadata: Metadata = {
  title: 'Dashboard — PlacementOS',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
