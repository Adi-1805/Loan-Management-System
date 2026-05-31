'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalculator';
import { Loading, ErrorState } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getDisbursement();
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

  const handleDisburse = async (id: string) => {
    try {
      await dashboardService.disburseLoan(id);
      toast.success('Loan marked as disbursed');
      fetchLoans();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetchLoans} />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Disbursement Module</h2>
      <p className="text-gray-600 mb-4">SANCTIONED loans ready for disbursement</p>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Borrower</th>
              <th className="px-4 py-3 text-left">Principal</th>
              <th className="px-4 py-3 text-left">Total Repayment</th>
              <th className="px-4 py-3 text-left">Sanctioned At</th>
              <th className="px-4 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No loans to disburse
                </td>
              </tr>
            ) : (
              loans.map((loan) => (
                <tr key={loan._id} className="border-t">
                  <td className="px-4 py-3">{getBorrowerName(loan)}</td>
                  <td className="px-4 py-3">{formatCurrency(loan.principalAmount)}</td>
                  <td className="px-4 py-3">{formatCurrency(loan.totalRepayment)}</td>
                  <td className="px-4 py-3">
                    {loan.sanctionedAt
                      ? new Date(loan.sanctionedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Button onClick={() => handleDisburse(loan._id)}>Mark Disbursed</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
