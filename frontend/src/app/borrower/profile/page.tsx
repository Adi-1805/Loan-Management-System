'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { profileSchema, ProfileForm } from '@/lib/validations';
import { EmploymentMode, BorrowerProfile, Loan, LoanStatus } from '@/types';
import { borrowerService } from '@/services/borrower.service';
import { formatCurrency } from '@/lib/loanCalculator';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import toast from 'react-hot-toast';

// ─── Loan pipeline steps ────────────────────────────────────────────────────

const PIPELINE_STEPS: { key: LoanStatus; label: string }[] = [
  { key: LoanStatus.APPLIED, label: 'Applied' },
  { key: LoanStatus.SANCTIONED, label: 'Sanctioned' },
  { key: LoanStatus.DISBURSED, label: 'Disbursed' },
  { key: LoanStatus.CLOSED, label: 'Closed' },
];

const STATUS_META: Record<
  LoanStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  [LoanStatus.LEAD]: {
    label: 'Lead',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
  [LoanStatus.APPLIED]: {
    label: 'Under Review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
  [LoanStatus.SANCTIONED]: {
    label: 'Sanctioned',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  [LoanStatus.DISBURSED]: {
    label: 'Disbursed — Repayment Active',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
  },
  [LoanStatus.CLOSED]: {
    label: 'Closed — Fully Repaid',
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  [LoanStatus.REJECTED]: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-300',
  },
};

// Returns the index of the current status in the pipeline (for the step bar).
// REJECTED maps to step 0 (Applied) to show where it broke.
const getPipelineIndex = (status: LoanStatus): number => {
  if (status === LoanStatus.REJECTED) return 0;
  return PIPELINE_STEPS.findIndex((s) => s.key === status);
};

// ─── Active Loan Card ────────────────────────────────────────────────────────

function ActiveLoanCard({ loan }: { loan: Loan }) {
  const meta = STATUS_META[loan.status];
  const currentStep = getPipelineIndex(loan.status);
  const isRejected = loan.status === LoanStatus.REJECTED;
  const isClosed = loan.status === LoanStatus.CLOSED;
  const isDisbursed = loan.status === LoanStatus.DISBURSED;
  const canReapply = isRejected || isClosed;

  return (
    <div className={`rounded-xl border-2 ${meta.border} ${meta.bg} p-6 mb-6`}>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Loan Application
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${meta.bg} ${meta.text} border ${meta.border}`}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Applied {new Date(loan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Pipeline steps — hidden for rejected */}
      {!isRejected && (
        <div className="flex items-center gap-0 mb-6">
          {PIPELINE_STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      done
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    } ${active ? 'ring-2 ring-primary-300 ring-offset-1' : ''}`}
                  >
                    {done && idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium whitespace-nowrap ${
                      done ? 'text-primary-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 mb-4 ${
                      idx < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection reason */}
      {isRejected && loan.rejectionReason && (
        <div className="mb-5 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">Reason for rejection</p>
          <p className="text-sm text-red-700 mt-0.5">{loan.rejectionReason}</p>
        </div>
      )}

      {/* Loan figures */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-500">Principal</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(loan.principalAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Interest ({loan.interestRate}% p.a.)</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(loan.simpleInterest)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total Repayment</p>
          <p className="text-base font-bold text-gray-900">{formatCurrency(loan.totalRepayment)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Tenure</p>
          <p className="text-base font-bold text-gray-900">{loan.tenureDays} days</p>
        </div>
      </div>

      {/* Repayment progress — only for disbursed / closed */}
      {(isDisbursed || isClosed) && (
        <div className="pt-4 border-t border-current border-opacity-20">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Repayment progress</span>
            <span className="font-medium">
              {formatCurrency(loan.totalPaid)} paid
            </span>
          </div>
          <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (loan.totalPaid / loan.totalRepayment) * 100).toFixed(1)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Outstanding: {formatCurrency(loan.outstandingAmount)}</span>
            <span>{((loan.totalPaid / loan.totalRepayment) * 100).toFixed(1)}% repaid</span>
          </div>
        </div>
      )}

      {/* Re-apply CTA for rejected / closed */}
      {canReapply && (
        <div className="mt-5 pt-4 border-t border-current border-opacity-20">
          <Link
            href="/borrower/apply"
            className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Apply for a New Loan →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Loan History Table ──────────────────────────────────────────────────────

// Compact badge used inside the history table — smaller than the ActiveLoanCard badge.
function StatusBadge({ status }: { status: LoanStatus }) {
  const styles: Record<LoanStatus, string> = {
    [LoanStatus.LEAD]:       'bg-gray-100 text-gray-600',
    [LoanStatus.APPLIED]:    'bg-amber-100 text-amber-700',
    [LoanStatus.SANCTIONED]: 'bg-blue-100 text-blue-700',
    [LoanStatus.DISBURSED]:  'bg-indigo-100 text-indigo-700',
    [LoanStatus.CLOSED]:     'bg-green-100 text-green-700',
    [LoanStatus.REJECTED]:   'bg-red-100 text-red-700',
  };
  const labels: Record<LoanStatus, string> = {
    [LoanStatus.LEAD]:       'Lead',
    [LoanStatus.APPLIED]:    'Under Review',
    [LoanStatus.SANCTIONED]: 'Sanctioned',
    [LoanStatus.DISBURSED]:  'Disbursed',
    [LoanStatus.CLOSED]:     'Closed',
    [LoanStatus.REJECTED]:   'Rejected',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function LoanHistoryTable({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) return null;

  return (
    <Card className="mb-6">
      <h3 className="font-semibold text-gray-900 mb-4">
        Loan History
        <span className="ml-2 text-xs font-normal text-gray-400">
          {loans.length} previous {loans.length === 1 ? 'loan' : 'loans'}
        </span>
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="pb-2 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500">Principal</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500">Repayment</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500">Tenure</th>
              <th className="pb-2 text-left text-xs font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <>
                <tr key={loan._id} className="border-b last:border-0">
                  <td className="py-3 text-gray-500">
                    {new Date(loan.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 font-medium">{formatCurrency(loan.principalAmount)}</td>
                  <td className="py-3 text-gray-600">{formatCurrency(loan.totalRepayment)}</td>
                  <td className="py-3 text-gray-600">{loan.tenureDays}d</td>
                  <td className="py-3">
                    <StatusBadge status={loan.status} />
                  </td>
                </tr>
                {/* Rejection reason shown inline below the row */}
                {loan.status === LoanStatus.REJECTED && loan.rejectionReason && (
                  <tr key={`${loan._id}-reason`} className="border-b last:border-0">
                    <td colSpan={5} className="pt-0 pb-3 text-xs text-red-600">
                      ↳ {loan.rejectionReason}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Profile Summary Card ────────────────────────────────────────────────────

function ProfileSummaryCard({ profile }: { profile: BorrowerProfile }) {
  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Your Profile</h3>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
          BRE Approved
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <span className="text-gray-500">Full Name</span>
        <span className="font-medium">{profile.fullName}</span>
        <span className="text-gray-500">PAN</span>
        <span className="font-medium">{profile.pan}</span>
        <span className="text-gray-500">Date of Birth</span>
        <span className="font-medium">
          {new Date(profile.dateOfBirth).toLocaleDateString('en-IN')}
        </span>
        <span className="text-gray-500">Monthly Salary</span>
        <span className="font-medium">{formatCurrency(profile.monthlySalary)}</span>
        <span className="text-gray-500">Employment</span>
        <span className="font-medium capitalize">
          {profile.employmentMode.toLowerCase().replace('_', ' ')}
        </span>
        <span className="text-gray-500">Salary Slip</span>
        <span className="font-medium">{profile.salarySlipUrl ? 'Uploaded ✓' : 'Not uploaded'}</span>
      </div>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type PageView = 'loading' | 'show_form' | 'goto_upload' | 'show_home';

export default function BorrowerProfilePage() {
  const router = useRouter();

  const [view, setView] = useState<PageView>('loading');
  const [profile, setProfile] = useState<BorrowerProfile | null>(null);
  const [activeLoan, setActiveLoan] = useState<Loan | null>(null);
  // All loans except the most recent one, shown as a history table.
  const [loanHistory, setLoanHistory] = useState<Loan[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [breErrors, setBreErrors] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { employmentMode: EmploymentMode.SALARIED },
  });

  useEffect(() => {
    // Fetch profile and loans in parallel for instant decision-making.
    Promise.all([
      borrowerService.getProfile().catch(() => null),
      borrowerService.getLoans().catch(() => null),
    ]).then(([profileRes, loansRes]) => {
      const p = profileRes?.data?.data?.profile ?? null;
      const loans = loansRes?.data?.data?.loans ?? [];

      setProfile(p);

      // Backend returns loans sorted newest-first.
      // loans[0] = current/most recent → shown in ActiveLoanCard.
      // loans[1..] = older loans        → shown in LoanHistoryTable.
      const latest = loans[0] ?? null;
      setActiveLoan(latest);
      setLoanHistory(loans.slice(1));

      if (latest) {
        // Always show the home screen whenever any loan exists.
        setView('show_home');
      } else if (!p) {
        // No profile at all — show the form.
        setView('show_form');
      } else if (!p.isBreApproved) {
        // Has profile but not yet BRE-approved — prefill and show form.
        reset({
          fullName: p.fullName,
          pan: p.pan,
          dateOfBirth: p.dateOfBirth.split('T')[0],
          monthlySalary: p.monthlySalary,
          employmentMode: p.employmentMode,
        });
        setView('show_form');
      } else if (!p.salarySlipUrl) {
        // BRE approved but no slip yet — redirect to upload.
        setView('goto_upload');
      } else {
        // BRE approved + slip uploaded, but no loan — show home with next-step CTA.
        setView('show_home');
      }
    });
  }, [reset]);

  // Redirect happens outside the render tree to keep the component clean.
  useEffect(() => {
    if (view === 'goto_upload') {
      router.push('/borrower/upload');
    }
  }, [view, router]);

  const onSubmit = async (data: ProfileForm) => {
    setSubmitting(true);
    setBreErrors([]);
    try {
      const res = await borrowerService.saveProfile(data);
      if (res.data.success) {
        toast.success('Profile approved by BRE');
        router.push('/borrower/upload');
      }
    } catch (err) {
      const e = err as Error & { errors?: string[] };
      toast.error(e.message);
      setBreErrors(e.errors?.length ? e.errors : [e.message]);
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'loading' || view === 'goto_upload') return <Loading />;

  // ── Profile form (BRE not yet done) ───────────────────────────────────────
  if (view === 'show_form') {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
        <p className="text-gray-600 mb-6">
          Complete your profile to run the Business Rule Engine check.
        </p>

        {breErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-800 mb-2">BRE Rejection</p>
            <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
              {breErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="PAN"
              placeholder="ABCDE1234F"
              error={errors.pan?.message}
              {...register('pan')}
            />
            <Input
              label="Date of Birth"
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
            <Input
              label="Monthly Salary (₹)"
              type="number"
              error={errors.monthlySalary?.message}
              {...register('monthlySalary')}
            />
            <Select
              label="Employment Mode"
              options={[
                { value: EmploymentMode.SALARIED, label: 'Salaried' },
                { value: EmploymentMode.SELF_EMPLOYED, label: 'Self Employed' },
                { value: EmploymentMode.UNEMPLOYED, label: 'Unemployed' },
              ]}
              error={errors.employmentMode?.message}
              {...register('employmentMode')}
            />
            <Button type="submit" loading={submitting}>
              Submit for BRE Check
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // ── Borrower home — loan status + profile summary ─────────────────────────
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-1">My Application</h2>
      <p className="text-gray-500 text-sm mb-6">Track your loan application status below.</p>

      {activeLoan ? (
        <ActiveLoanCard loan={activeLoan} />
      ) : (
        // BRE approved, slip uploaded, no loan yet.
        <Card className="mb-6">
          <p className="font-medium text-gray-800 mb-1">You have no active loan application.</p>
          <p className="text-sm text-gray-500 mb-4">
            Your profile and salary slip are ready. Apply for a loan now.
          </p>
          <Link
            href="/borrower/apply"
            className="inline-block px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Apply for a Loan →
          </Link>
        </Card>
      )}

      {profile && <ProfileSummaryCard profile={profile} />}

      {/* Loan history — only rendered when the borrower has more than one loan */}
      <LoanHistoryTable loans={loanHistory} />
    </div>
  );
}
