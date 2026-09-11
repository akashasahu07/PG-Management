'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import {
  KeyRound,
  CreditCard,
  LifeBuoy,
  BedDouble,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function LandingPage() {
  const [residentId, setResidentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleResidentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!residentId.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/resident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId: residentId.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate.');
      }

      router.push('/resident');
    } catch (err: any) {
      setError(err.message || 'Resident ID not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (id: string) => {
    setResidentId(id);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors">
      {/* Background Liquid Blobs */}
      <div className="liquid-blob-1 top-[-100px] left-[-100px]" />
      <div className="liquid-blob-2 top-[30%] right-[-150px]" />

      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 w-full">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Generation Living Experience</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Comfortable Stay.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-500 dark:from-indigo-400 dark:via-sky-400 dark:to-teal-300 bg-clip-text text-transparent">
                Simplified Living.
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Welcome to <strong>Elite Homes</strong>. Access your stay details, rent payment receipts, and lodge maintenance requests with your unique Resident ID in seconds.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Transparent Rent & Due Tracker</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant Digital PDF Receipts</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Swift Complaint Resolution</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Modern 6-Floor Accommodation</span>
              </div>
            </div>
          </div>

          {/* Resident Quick Access Box */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resident Portal Access</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Enter your unique ID to view your dashboard</p>
                </div>
              </div>

              <form onSubmit={handleResidentLogin} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Resident ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. EH-A07-001"
                      value={residentId}
                      onChange={(e) => setResidentId(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono text-base font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none transition-all uppercase tracking-wider"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all group disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Access My Resident Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Sample Resident IDs shortcut */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                  <span>Sample Resident IDs</span>
                  <span className="text-[10px] text-indigo-500 font-normal">Click to quick-fill</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'EH-A07-001', label: 'Rahul (Room A7)' },
                    { id: 'EH-B04-001', label: 'Amit (Room B4)' },
                    { id: 'EH-G01-001', label: 'Priya (Room G1)' },
                  ].map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleDemoFill(demo.id)}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white transition-colors"
                    >
                      {demo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin login hint */}
              <div className="mt-4 text-center">
                <Link
                  href="/admin/login"
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                  PG Owner Portal &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 pt-16 border-t border-slate-200 dark:border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BedDouble className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">287 Premium Beds</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Spread across Ground Floor (6-sharing) and Floors A–E (2, 3, 4, and 5-sharing options) with hygienic amenities.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Flexible Billing Cycles</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rent calculated accurately from your joining date anniversary with automated receipts and zero notebook hassles.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Complaint Tracker</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Lodge maintenance issues for plumbing, Wi-Fi, or electrical and track real-time resolution stages.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 py-6 text-center text-xs text-slate-500">
        Elite Homes Hostel & PG Management System
      </footer>
    </div>
  );
}
