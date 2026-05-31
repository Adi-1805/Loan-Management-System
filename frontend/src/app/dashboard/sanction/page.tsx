'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalculator';
import { Loading, ErrorState } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getSanction();
      setLoans(res.data.data.loans);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const getBorrowerName = (loan: Loan) => {
    const b = loan.borrowerId;
    return typeof b === 'object' && b !== null ? b.name : '—';
  };

  const handleApprove = async (id: string) => {
    try {
      await dashboardService.approveLoan(id);
      toast.success('Loan sanctioned');
      fetchLoans();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleReject = async (id: string) => {
    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }
    try {
      await dashboardService.rejectLoan(id, reason);
      toast.success('Loan rejected');
      setRejectId(null);
      setReason('');
      fetchLoans();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetchLoans} />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Sanction Module</h2>
      <p className="text-gray-600 mb-4">Review APPLIED loans</p>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <p className="text-gray-500">No loans pending sanction</p>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-xl border p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-semibold">{getBorrowerName(loan)}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(loan.principalAmount)} · {loan.tenureDays} days ·{' '}
                    {formatCurrency(loan.totalRepayment)} total
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(loan._id)}>Approve</Button>
                  <Button variant="danger" onClick={() => setRejectId(loan._id)}>
                    Reject
                  </Button>
                </div>
              </div>
              {rejectId === loan._id && (
                <div className="mt-4 pt-4 border-t">
                  <textarea
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Rejection reason (required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="danger" onClick={() => handleReject(loan._id)}>
                      Confirm Reject
                    </Button>
                    <Button variant="outline" onClick={() => setRejectId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
