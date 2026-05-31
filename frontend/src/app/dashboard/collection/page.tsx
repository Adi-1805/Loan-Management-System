'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dashboardService } from '@/services/dashboard.service';
import { Loan } from '@/types';
import { formatCurrency } from '@/lib/loanCalculator';
import { paymentSchema, PaymentForm } from '@/lib/validations';
import { Loading, ErrorState } from '@/components/ui/Loading';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentForm>({ resolver: zodResolver(paymentSchema) });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getCollection();
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

  const onSubmit = async (data: PaymentForm) => {
    if (!selectedLoan) return;
    setSubmitting(true);
    try {
      await dashboardService.recordPayment(selectedLoan._id, data);
      toast.success('Payment recorded');
      setSelectedLoan(null);
      reset();
      fetchLoans();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={fetchLoans} />;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Collection Module</h2>
      <p className="text-gray-600 mb-4">DISBURSED loans — record payments</p>

      <div className="space-y-4">
        {loans.length === 0 ? (
          <p className="text-gray-500">No loans in collection</p>
        ) : (
          loans.map((loan) => (
            <div key={loan._id} className="bg-white rounded-xl border p-6">
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <p className="font-semibold">{getBorrowerName(loan)}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2">
                    <span className="text-gray-500">Principal:</span>
                    <span>{formatCurrency(loan.principalAmount)}</span>
                    <span className="text-gray-500">Total Repayment:</span>
                    <span>{formatCurrency(loan.totalRepayment)}</span>
                    <span className="text-gray-500">Paid:</span>
                    <span>{formatCurrency(loan.totalPaid)}</span>
                    <span className="text-gray-500">Outstanding:</span>
                    <span className="font-semibold text-primary-700">
                      {formatCurrency(loan.outstandingAmount)}
                    </span>
                  </div>
                </div>
                <Button onClick={() => setSelectedLoan(loan)}>Record Payment</Button>
              </div>

              {selectedLoan?._id === loan._id && (
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 pt-4 border-t grid md:grid-cols-3 gap-4">
                  <Input label="UTR Number" error={errors.utrNumber?.message} {...register('utrNumber')} />
                  <Input
                    label="Amount"
                    type="number"
                    error={errors.amount?.message}
                    {...register('amount')}
                  />
                  <Input
                    label="Payment Date"
                    type="date"
                    error={errors.paymentDate?.message}
                    {...register('paymentDate')}
                  />
                  <div className="md:col-span-3 flex gap-2">
                    <Button type="submit" loading={submitting}>
                      Submit Payment
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedLoan(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
