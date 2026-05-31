'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { applyLoanSchema, ApplyLoanForm } from '@/lib/validations';
import {
  calculateSimpleInterest,
  calculateTotalRepayment,
  formatCurrency,
  roundCurrency,
} from '@/lib/loanCalculator';
import { INTEREST_RATE, MIN_LOAN, MAX_LOAN, MIN_TENURE, MAX_TENURE } from '@/lib/constants';
import { LoanStatus } from '@/types';
import { borrowerService } from '@/services/borrower.service';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import toast from 'react-hot-toast';

// Statuses that block a new application — must match backend BLOCKING_STATUSES.
const BLOCKING_STATUSES: LoanStatus[] = [
  LoanStatus.APPLIED,
  LoanStatus.SANCTIONED,
  LoanStatus.DISBURSED,
];

// Human-readable reason for each blocking status.
const BLOCK_REASON: Record<string, { title: string; detail: string }> = {
  [LoanStatus.APPLIED]: {
    title: 'Application Already Under Review',
    detail:
      'You already have a loan application that is currently being reviewed by our team. You cannot submit a new application until it is either sanctioned or rejected.',
  },
  [LoanStatus.SANCTIONED]: {
    title: 'Loan Already Sanctioned',
    detail:
      'You have a sanctioned loan that is awaiting disbursement. You cannot apply for a new loan until the current one is fully processed or rejected.',
  },
  [LoanStatus.DISBURSED]: {
    title: 'Active Loan in Repayment',
    detail:
      'You have a disbursed loan with an outstanding balance. Please repay your current loan in full before applying for a new one.',
  },
};

// ─── Blocked Modal ────────────────────────────────────────────────────────────

function BlockedModal({
  title,
  detail,
  onConfirm,
}: {
  title: string;
  detail: string;
  onConfirm: () => void;
}) {
  return (
    // Full-screen overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 mx-auto mb-4">
          <svg
            className="w-6 h-6 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h2>
        <p className="text-sm text-gray-600 text-center mb-6">{detail}</p>

        <Button className="w-full" onClick={onConfirm}>
          View My Application
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplyLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // When non-null, the blocked modal is shown instead of (or over) the form.
  const [blockReason, setBlockReason] = useState<{ title: string; detail: string } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplyLoanForm>({
    resolver: zodResolver(applyLoanSchema),
    defaultValues: { principalAmount: 100000, tenureDays: 180 },
  });

  const principal = watch('principalAmount') || 0;
  const tenure = watch('tenureDays') || 0;
  const interest = roundCurrency(calculateSimpleInterest(principal, INTEREST_RATE, tenure));
  const total = roundCurrency(calculateTotalRepayment(principal, interest));

  useEffect(() => {
    // Run profile check and loan check in parallel.
    Promise.all([borrowerService.getProfile(), borrowerService.getLoans()])
      .then(([profileRes, loansRes]) => {
        const p = profileRes.data.data.profile;
        const loans = loansRes.data.data.loans;

        if (!p?.isBreApproved) {
          router.push('/borrower/profile');
          return;
        }
        if (!p.salarySlipUrl) {
          router.push('/borrower/upload');
          return;
        }

        // Find the first loan that is in a blocking status (most recent loan is first).
        const activeLoan = loans.find((l) => BLOCKING_STATUSES.includes(l.status));
        if (activeLoan) {
          // Show the blocking modal — do NOT redirect yet.
          // The redirect happens only after the user clicks "View My Application".
          setBlockReason(
            BLOCK_REASON[activeLoan.status] ?? {
              title: 'Cannot Apply Right Now',
              detail:
                'You have an active loan. Please wait until it is closed or rejected before applying again.',
            }
          );
          setLoading(false);
          return;
        }

        setLoading(false);
      })
      .catch(() => router.push('/borrower/profile'));
  }, [router]);

  const onSubmit = async (data: ApplyLoanForm) => {
    setSubmitting(true);
    try {
      await borrowerService.applyLoan(data);
      toast.success('Loan application submitted!');
      router.push('/borrower/profile');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      {/* Blocking modal — rendered on top of the page when an active loan exists */}
      {blockReason && (
        <BlockedModal
          title={blockReason.title}
          detail={blockReason.detail}
          onConfirm={() => router.push('/borrower/profile')}
        />
      )}

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">Loan Configuration</h2>
        <p className="text-gray-600 mb-6">
          Configure your loan ({formatCurrency(MIN_LOAN)} – {formatCurrency(MAX_LOAN)})
        </p>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label={`Principal Amount (₹${MIN_LOAN} – ₹${MAX_LOAN})`}
              type="number"
              error={errors.principalAmount?.message}
              {...register('principalAmount')}
            />
            <Input
              label={`Tenure (Days: ${MIN_TENURE} – ${MAX_TENURE})`}
              type="number"
              error={errors.tenureDays?.message}
              {...register('tenureDays')}
            />

            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Interest Rate:</span>{' '}
                <strong>{INTEREST_RATE}% p.a.</strong>
              </p>
              <p>
                <span className="text-gray-500">Principal:</span>{' '}
                <strong>{formatCurrency(principal)}</strong>
              </p>
              <p>
                <span className="text-gray-500">Simple Interest:</span>{' '}
                <strong>{formatCurrency(interest)}</strong>
              </p>
              <p>
                <span className="text-gray-500">Total Repayment:</span>{' '}
                <strong className="text-primary-700">{formatCurrency(total)}</strong>
              </p>
              <p className="text-xs text-gray-400">SI = (P × R × T) / (365 × 100)</p>
            </div>

            <Button type="submit" loading={submitting}>
              Apply for Loan
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
