'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  LifeBuoy,
  Bell,
  Settings,
  Home,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Residents', href: '/admin/residents', icon: Users },
  { label: 'Rooms & Building', href: '/admin/rooms', icon: Building2 },
  { label: 'Payments & Rent', href: '/admin/payments', icon: CreditCard },
  { label: 'Complaints', href: '/admin/complaints', icon: LifeBuoy },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Settings & Security', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/admin', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] p-4 border-r border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl transition-colors no-print">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Operations Management
          </p>
        </div>

        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors"
        >
          <Home className="w-3.5 h-3.5 text-slate-400" />
          <span>Public Landing Page</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
