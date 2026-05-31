import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Loan Management System</h1>
        <p className="text-lg text-gray-600 mb-8">
          End-to-end lending platform with Business Rule Engine, RBAC, and full loan lifecycle
          management from application to closure.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50"
          >
            Register as Borrower
          </Link>
        </div>
        <div className="mt-12 p-6 bg-white rounded-xl shadow-sm text-left text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-2">Demo accounts (password: Password@123)</p>
          <ul className="space-y-1">
            <li>admin@example.com · sales@example.com · sanction@example.com</li>
            <li>disbursement@example.com · collection@example.com · borrower@example.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
