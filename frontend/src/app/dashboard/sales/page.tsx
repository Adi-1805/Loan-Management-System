'use client';

import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { SalesLead } from '@/types';
import { Loading, ErrorState } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SalesPage() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async (p: number, s: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.getSales(p, s);
      setLeads(res.data.data.data);
      setTotalPages(res.data.data.totalPages);
      setTotal(res.data.data.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever page changes (search is committed via the Search button).
  useEffect(() => {
    fetchLeads(page, search);
  }, [page, fetchLeads]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    // Always reset to page 1 on a new search so stale pagination is avoided.
    setPage(1);
    fetchLeads(1, search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Sales Module</h2>
        {!loading && (
          <span className="text-sm text-gray-500">{total} lead{total !== 1 ? 's' : ''}</span>
        )}
      </div>
      <p className="text-gray-600 mb-6">
        Borrowers who registered but have not yet submitted a loan application.
      </p>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-0 flex-1"
        />
        <Button onClick={handleSearch}>Search</Button>
        {search && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setPage(1);
              fetchLeads(1, '');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {loading && <Loading />}
      {error && <ErrorState message={error} onRetry={() => fetchLeads(page, search)} />}

      {!loading && !error && (
        <div className="bg-white rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Registered On</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Profile</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    {search ? `No leads match "${search}"` : 'No leads found'}
                  </td>
                </tr>
              ) : (
                leads.map((l, idx) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400">
                      {(page - 1) * 10 + idx + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{l.name}</td>
                    <td className="px-4 py-3 text-gray-600">{l.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(l.registrationDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          l.hasProfile
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {l.hasProfile ? 'Submitted' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
