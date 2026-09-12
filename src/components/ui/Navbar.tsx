'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { Shield, User, LogOut } from 'lucide-react';

interface NavbarProps {
  userRole?: 'ADMIN' | 'RESIDENT' | null;
  userName?: string;
  userSubtitle?: string;
}

export function Navbar({ userRole, userName, userSubtitle }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (userRole === 'ADMIN') {
      await fetch('/api/auth/admin', { method: 'DELETE' });
      window.location.href = '/admin/login';
    } else if (userRole === 'RESIDENT') {
      await fetch('/api/auth/resident', { method: 'DELETE' });
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <BrandLogo size={42} className="group-hover:scale-105 transition-transform duration-200" />
          <div>
            <div className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Elite Homes
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                PG
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
              Hostel & Accommodation Management
            </p>
          </div>
        </Link>

        {/* Right side items */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {userRole === 'ADMIN' ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  {userName || 'Administrator'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{userSubtitle || 'Admin Portal'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : userRole === 'RESIDENT' ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-500" />
                  {userName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{userSubtitle}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {pathname !== '/admin/login' && (
                <Link
                  href="/admin/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/50 transition-all"
                >
                  Admin Portal
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
