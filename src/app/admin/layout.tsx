'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [adminUser, setAdminUser] = useState<{ name?: string; username?: string } | null>(null);

  useEffect(() => {
    if (pathname !== '/admin/login') {
      fetch('/api/admin/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.admin) {
            setAdminUser(data.admin);
          }
        })
        .catch(() => {});
    }
  }, [pathname]);

  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors">
      <Navbar
        userRole="ADMIN"
        userName={adminUser?.name || adminUser?.username || 'Administrator'}
        userSubtitle={adminUser?.username ? `@${adminUser.username} • Master Admin` : 'Elite Homes Admin'}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden min-w-0 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
