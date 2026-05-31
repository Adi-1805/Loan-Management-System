'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';
import { Role } from '@/types';

const mobileNav: { label: string; href: string; roles: Role[] }[] = [
  { label: 'Dashboard', href: '/dashboard',              roles: [Role.ADMIN] },
  { label: 'Sales',     href: '/dashboard/sales',        roles: [Role.ADMIN, Role.SALES] },
  { label: 'Sanction',  href: '/dashboard/sanction',     roles: [Role.ADMIN, Role.SANCTION] },
  { label: 'Disburse',  href: '/dashboard/disbursement', roles: [Role.ADMIN, Role.DISBURSEMENT] },
  { label: 'Collect',   href: '/dashboard/collection',   roles: [Role.ADMIN, Role.COLLECTION] },
  { label: 'Profile',   href: '/borrower/profile',       roles: [Role.BORROWER] },
  { label: 'Upload',    href: '/borrower/upload',        roles: [Role.BORROWER] },
  { label: 'Apply',     href: '/borrower/apply',         roles: [Role.BORROWER] },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = user ? mobileNav.filter((n) => n.roles.includes(user.role)) : [];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Loan Management System</h1>
          {user && (
            <p className="text-xs text-gray-500">
              {user.name} · {user.role}
            </p>
          )}
        </div>
        {user && (
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        )}
      </div>
      {user && links.length > 0 && (
        <nav className="lg:hidden flex gap-1 overflow-x-auto px-4 pb-2">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1.5 text-xs rounded-full ${
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
