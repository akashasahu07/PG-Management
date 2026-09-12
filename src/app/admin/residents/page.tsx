'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  CreditCard,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { AddResidentModal } from '@/components/admin/AddResidentModal';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [floor, setFloor] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [paymentFilter, setPaymentFilter] = useState('');

  // Modals
  const [showAddResident, setShowAddResident] = useState(false);
  const [recordPaymentForResident, setRecordPaymentForResident] = useState<string | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);

  useEffect(() => {
    fetchResidents();
  }, [floor, status, paymentFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddResident(false);
        setRecordPaymentForResident(null);
        setReceiptPayment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchResidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (floor) params.append('floor', floor);
      if (status) params.append('status', status);
      if (paymentFilter) params.append('payment', paymentFilter);

      const res = await fetch(`/api/admin/residents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load residents');
      const data = await res.json();
      setResidents(data.residents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResidents();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-500" />
            <span>Resident Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage active occupants, room assignments, stay records, and checkout
          </p>
        </div>

        <button
          onClick={() => setShowAddResident(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Resident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by resident name, phone, ID, or room number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Floor Filter */}
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="">All Floors</option>
              <option value="G">Ground Floor</option>
              <option value="A">1st Floor (A)</option>
              <option value="B">2nd Floor (B)</option>
              <option value="C">3rd Floor (C)</option>
              <option value="D">4th Floor (D)</option>
              <option value="E">5th Floor (E)</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="">All Rent Statuses</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DUE_TODAY">Due Today</option>
              <option value="DUE_SOON">Due Soon</option>
              <option value="PAID">Paid</option>
            </select>

            {/* Resident Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="ACTIVE">Active Residents</option>
              <option value="CHECKED_OUT">Checked Out</option>
              <option value="">All Records</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Residents List / Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Loading directory...</span>
          </div>
        ) : residents.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">No Residents Found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Resident</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Accommodation</th>
                  <th className="p-4">Rent</th>
                  <th className="p-4">Due Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {residents.map((r) => {
                  const rentStatus = r.rentStatus?.status || 'PENDING';
                  const daysRemaining = r.rentStatus?.daysRemaining;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                      {/* Name & ID */}
                      <td className="p-4">
                        <Link
                          href={`/admin/residents/${r.id}`}
                          className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                        >
                          <span>{r.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 font-medium">
                          {r.residentId}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-4">
                        <a
                          href={`tel:${r.phone}`}
                          className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white flex items-center gap-1.5 font-medium"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{r.phone}</span>
                        </a>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Joined {formatDate(r.joiningDate)}
                        </div>
                      </td>

                      {/* Accommodation */}
                      <td className="p-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Room {r.room?.roomNumber} • Bed #{r.bed?.bedNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {r.room?.floor?.displayName} ({r.room?.sharingCapacity}-Sharing)
                        </div>
                      </td>

                      {/* Monthly Rent */}
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(r.monthlyRent)}
                        <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                      </td>

                      {/* Rent Due Status */}
                      <td className="p-4">
                        {r.status === 'CHECKED_OUT' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Checked Out
                          </span>
                        ) : (
                          <div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
                                rentStatus === 'OVERDUE'
                                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                                  : rentStatus === 'DUE_TODAY'
                                  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                                  : rentStatus === 'DUE_SOON'
                                  ? 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30'
                                  : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                              }`}
                            >
                              {rentStatus === 'OVERDUE' && <AlertCircle className="w-3 h-3" />}
                              {rentStatus === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                              <span>{rentStatus.replace('_', ' ')}</span>
                            </span>
                            {r.rentStatus?.dueDate && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                Due: {formatDate(r.rentStatus.dueDate)}
                                {daysRemaining !== undefined && daysRemaining > 0 && ` (${daysRemaining}d left)`}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2">
                        {r.status === 'ACTIVE' && (
                          <button
                            onClick={() => setRecordPaymentForResident(r.id)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-200 dark:border-slate-700 transition-colors inline-flex items-center gap-1"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/residents/${r.id}`}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors inline-block"
                        >
                          Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Resident Modal */}
      <AddResidentModal
        isOpen={showAddResident}
        onClose={() => setShowAddResident(false)}
        onResidentAdded={fetchResidents}
      />

      {/* Record Payment Modal */}
      {recordPaymentForResident && (
        <RecordPaymentModal
          isOpen={!!recordPaymentForResident}
          initialResidentId={recordPaymentForResident}
          onClose={() => setRecordPaymentForResident(null)}
          onPaymentRecorded={(payment) => {
            fetchResidents();
            setReceiptPayment(payment);
          }}
        />
      )}

      {/* Receipt View Modal */}
      <ReceiptModal
        payment={receiptPayment}
        onClose={() => setReceiptPayment(null)}
      />
    </div>
  );
}
