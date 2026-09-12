'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BedDouble,
  Percent,
  AlertTriangle,
  LifeBuoy,
  Building,
  UserPlus,
  CreditCard,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { AddResidentModal } from '@/components/admin/AddResidentModal';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddResident, setShowAddResident] = useState(false);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddResident(false);
        setShowRecordPayment(false);
        setSelectedReceiptPayment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        throw new Error('Failed to load dashboard');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading live PG operations data...</p>
      </div>
    );
  }

  const { stats, floorBreakdown, recentPayments, recentComplaints } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time occupancy, automated rent billing, and hostel operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddResident(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Resident</span>
          </button>

          <button
            onClick={() => setShowRecordPayment(true)}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm dark:shadow-none"
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Residents */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Residents</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.totalResidents ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Active occupants in PG</p>
        </div>

        {/* Occupied Beds */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md relative overflow-hidden group hover:border-sky-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Occupied Beds</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 flex items-baseline gap-1.5">
            <span>{stats?.occupiedBeds ?? 0}</span>
            <span className="text-xs text-slate-400 font-normal">/ {stats?.totalBeds ?? 287}</span>
          </div>
          <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">
            {stats?.availableBeds ?? 0} beds available
          </p>
        </div>

        {/* Occupancy Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Occupancy Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
            {stats?.occupancyRate ?? 0}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats?.occupancyRate ?? 0}%` }}
            />
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md relative overflow-hidden group hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Rent</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-3">
            {stats?.rentOverdueCount ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats?.rentDueTodayCount ?? 0} due today
          </p>
        </div>
      </div>

      {/* Floor-by-Floor Occupancy Progress */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" />
              <span>Building Floor Occupancy (287 Total Beds)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown across Ground Floor & Floors A–E
            </p>
          </div>
          <Link
            href="/admin/rooms"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Interactive Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {floorBreakdown?.map((floor: any) => (
            <div
              key={floor.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{floor.displayName}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                  {floor.occupiedBeds} / {floor.totalBeds} Beds
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    floor.occupancyRate >= 90
                      ? 'bg-rose-500'
                      : floor.occupancyRate >= 70
                      ? 'bg-amber-500'
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${floor.occupancyRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>{floor.availableBeds} beds available</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{floor.occupancyRate}% occupied</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Payments & Recent Complaints */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              <span>Recent Rent Payments</span>
            </h3>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.map((p: any) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.resident?.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Room {p.resident?.room?.roomNumber} • {formatDate(p.paymentDate)} • {p.paymentMethod}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.paymentId}</div>
                    </div>
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                      title="View Official Receipt"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No payment records yet.</p>
            )}
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-sky-500" />
              <span>Complaints & Tickets</span>
            </h3>
            <Link
              href="/admin/complaints"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentComplaints && recentComplaints.length > 0 ? (
              recentComplaints.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {c.subject}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        c.status === 'RESOLVED' || c.status === 'CLOSED'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>{c.resident?.name} (Room {c.resident?.room?.roomNumber})</span>
                    <span className="font-mono text-slate-400">{c.ticketId}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No complaints logged.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Resident Modal */}
      <AddResidentModal
        isOpen={showAddResident}
        onClose={() => setShowAddResident(false)}
        onResidentAdded={fetchDashboard}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showRecordPayment}
        onClose={() => setShowRecordPayment(false)}
        onPaymentRecorded={(payment) => {
          fetchDashboard();
          setSelectedReceiptPayment(payment);
        }}
      />

      {/* Receipt Viewer Modal */}
      <ReceiptModal
        payment={selectedReceiptPayment}
        onClose={() => setSelectedReceiptPayment(null)}
      />
    </div>
  );
}
