'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  roles: Role[];
}

// "Dashboard" is only shown to ADMIN — it leads to the stats overview at /dashboard.
// Every other operational role already has a dedicated module link below,
// so adding a "Dashboard" entry for them would create two items with the same
// resolved href and trigger a React duplicate-key error.
const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',               roles: [Role.ADMIN] },
  { label: 'Sales',       href: '/dashboard/sales',         roles: [Role.ADMIN, Role.SALES] },
  { label: 'Sanction',    href: '/dashboard/sanction',      roles: [Role.ADMIN, Role.SANCTION] },
  { label: 'Disbursement',href: '/dashboard/disbursement',  roles: [Role.ADMIN, Role.DISBURSEMENT] },
  { label: 'Collection',  href: '/dashboard/collection',    roles: [Role.ADMIN, Role.COLLECTION] },
  { label: 'Profile',     href: '/borrower/profile',        roles: [Role.BORROWER] },
  { label: 'Upload Slip', href: '/borrower/upload',         roles: [Role.BORROWER] },
  { label: 'Apply Loan',  href: '/borrower/apply',          roles: [Role.BORROWER] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const visible = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-[calc(100vh-4rem)] hidden lg:block">
      <nav className="p-4 space-y-1">
        {visible.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`block px-4 py-2.5 rounded-lg text-sm transition ${
              pathname === item.href
                ? 'bg-primary-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
