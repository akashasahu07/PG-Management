'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  BedDouble,
  Building,
  CreditCard,
  LifeBuoy,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';

export default function ResidentDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/resident/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.resident);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading your stay information...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-xs text-slate-500 dark:text-slate-400">Unable to load profile data.</p>
      </div>
    );
  }

  const { rentStatus, room, bed } = profile;
  const statusKey = rentStatus?.status || 'PENDING';
  const latestPayment = profile.payments && profile.payments[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 dark:from-indigo-900/60 dark:via-slate-900/80 dark:to-sky-950/60 border border-indigo-400/30 dark:border-indigo-500/20 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-indigo-200 dark:text-indigo-400 uppercase tracking-wider">
              Elite Homes Resident
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Welcome, {profile.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 dark:text-slate-300 mt-1">
              Resident ID: <span className="font-mono font-bold text-white dark:text-indigo-300">{profile.residentId}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/resident/complaints"
              className="px-4 py-2.5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-black/10 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Raise Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Accommodation & Rent Due Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Room & Bed Stay Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              My Accommodation
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Room Number</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {room?.roomNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{room?.floor?.displayName}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Allocated Bed</div>
              <div className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-0.5">
                Bed #{bed?.bedNumber}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {room?.sharingCapacity}-Sharing Room
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Joined on {formatDate(profile.joiningDate)}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(profile.monthlyRent)} / mo
            </span>
          </div>
        </div>

        {/* Rent Due & Status Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rent Billing Cycle
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                statusKey === 'OVERDUE'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  : statusKey === 'DUE_TODAY'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                  : statusKey === 'PAID'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
              }`}
            >
              {statusKey === 'PAID' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span>{statusKey.replace('_', ' ')}</span>
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Next Payment Due Date</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {rentStatus?.dueDate ? formatDate(rentStatus.dueDate) : '—'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Current cycle:{' '}
              <strong className="text-slate-700 dark:text-slate-200">
                {rentStatus?.startDate ? formatDate(rentStatus.startDate) : ''} –{' '}
                {rentStatus?.endDate ? formatDate(rentStatus.endDate) : ''}
              </strong>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {rentStatus?.daysRemaining !== undefined && rentStatus.daysRemaining > 0
                ? `${rentStatus.daysRemaining} days remaining in cycle`
                : rentStatus?.daysRemaining === 0
                ? 'Rent due today'
                : 'Rent is pending'}
            </span>
            <Link
              href="/resident/payments"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>View Invoices</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Payment & Quick Receipt Download */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-4 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Latest Payment Receipt</span>
          </h3>
          <Link
            href="/resident/payments"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>All Receipts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {latestPayment ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                {latestPayment.paymentId}
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {formatCurrency(latestPayment.amount)} • Paid via {latestPayment.paymentMethod}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paid on {formatDate(latestPayment.paymentDate)} for period{' '}
                {formatDate(latestPayment.billingStartDate)} – {formatDate(latestPayment.billingEndDate)}
              </div>
            </div>

            <button
              onClick={() =>
                setSelectedReceipt({
                  ...latestPayment,
                  resident: {
                    id: profile.id,
                    residentId: profile.residentId,
                    name: profile.name,
                    phone: profile.phone,
                    joiningDate: profile.joiningDate,
                    room: profile.room,
                    bed: profile.bed,
                  },
                })
              }
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Download / Print Receipt</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-4 text-center">No payment receipts on file.</p>
        )}
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReceipt(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ReceiptCard
              payment={selectedReceipt}
              onClose={() => setSelectedReceipt(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
