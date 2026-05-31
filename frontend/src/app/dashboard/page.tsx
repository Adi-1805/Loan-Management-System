'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.service';
import { StatCard } from '@/components/ui/Card';
import { Loading, ErrorState } from '@/components/ui/Loading';
import Link from 'next/link';

// This page is ADMIN-only. Non-admin users are redirected away by middleware
// before this component ever loads, so no role check is needed here.
export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    dashboardService
      .getStats()
      .then((res) => setStats(res.data.data.stats))
      .catch((err) => setError((err as Error).message))
      .finally(() => setStatsLoading(false));
  }, [authLoading]);

  if (authLoading || statsLoading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Total Loans" value={stats.totalLoans} />
          <StatCard title="Applied" value={stats.applied} />
          <StatCard title="Sanctioned" value={stats.sanctioned} />
          <StatCard title="Disbursed" value={stats.disbursed} />
          <StatCard title="Closed" value={stats.closed} />
          <StatCard title="Rejected" value={stats.rejected} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { href: '/dashboard/sales', label: 'Sales Module' },
          { href: '/dashboard/sanction', label: 'Sanction Module' },
          { href: '/dashboard/disbursement', label: 'Disbursement Module' },
          { href: '/dashboard/collection', label: 'Collection Module' },
        ].map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="p-6 bg-white rounded-xl border hover:border-primary-500 transition"
          >
            {m.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
