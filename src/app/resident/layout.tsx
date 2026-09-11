'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import { Home, CreditCard, LifeBuoy, Loader2 } from 'lucide-react';

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (data.role !== 'RESIDENT') {
        router.push('/');
        return;
      }
      setResident(data.user);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading your resident account...</p>
      </div>
    );
  }

  const NAV_ITEMS = [
    { label: 'My Stay', href: '/resident', icon: Home },
    { label: 'Rent & Receipts', href: '/resident/payments', icon: CreditCard },
    { label: 'Complaints', href: '/resident/complaints', icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-20 md:pb-6">
      <Navbar
        userRole="RESIDENT"
        userName={resident?.name || 'Resident'}
        userSubtitle={`ID: ${resident?.residentId || ''} • Room ${resident?.roomNumber || ''}`}
      />

      {/* Desktop Subnav Bar */}
      <div className="hidden md:block border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-500'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 min-w-0">
        {children}
      </main>

      {/* Mobile-First Bottom Quick Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2.5 px-4 shadow-lg dark:shadow-2xl">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[10px] font-semibold transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
