'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '../ui/Loading';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
