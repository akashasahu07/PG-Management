'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowRecordModal(false);
        setSelectedReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/api/payments?status=${statusFilter}` : '/api/payments';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load payments');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.paymentId?.toLowerCase().includes(q) ||
      p.resident?.name?.toLowerCase().includes(q) ||
      p.resident?.residentId?.toLowerCase().includes(q) ||
      p.resident?.room?.roomNumber?.toLowerCase().includes(q)
    );
  });

  const totalCollected = payments.reduce((acc, p) => acc + (p.status === 'PAID' ? p.amount : 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-emerald-500" />
            <span>Payments & Rent Billing</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track transactions, billing cycle dates, and issue official print-ready receipts
          </p>
        </div>

        <button
          onClick={() => setShowRecordModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Revenue Collected</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalCollected)}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Invoices Issued</div>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{payments.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Payment Gateways & Modes</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-1">UPI • Cash • Bank Transfer • Card</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by receipt #, resident, room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none w-full sm:w-auto"
          >
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Loading payment ledger...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <CreditCard className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">No Payments Found</h3>
            <p className="text-xs text-slate-500">Record a payment to view transactions here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Resident</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Billing Cycle</th>
                  <th className="p-4">Method & Ref</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{p.paymentId}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.resident?.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Room {p.resident?.room?.roomNumber} (Bed #{p.resident?.bed?.bedNumber})
                      </div>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{formatDate(p.paymentDate)}</td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {formatDate(p.billingStartDate)} – {formatDate(p.billingEndDate)}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{p.paymentMethod}</span>
                      {p.transactionRef && (
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {p.transactionRef}</div>
                      )}
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm hover:shadow"
                      >
                        <Printer className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Save / View Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onPaymentRecorded={(payment) => {
          fetchPayments();
          setSelectedReceipt(payment);
        }}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        payment={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
