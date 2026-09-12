'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

export default function ResidentPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      if (!res.ok) throw new Error('Failed to load payments');
      const data = await res.json();
      setPayments(data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          <span>My Rent Payments & Invoices</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review past monthly cycles, transaction details, and download digital PDF receipts
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-emerald-600 dark:text-emerald-500 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading invoices...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="py-20 text-center space-y-2 p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Invoices Found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Payment records will appear here once recorded by the administrator.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {p.paymentId}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                    {p.status}
                  </span>
                </div>

                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {formatCurrency(p.amount)} • Paid via {p.paymentMethod}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Billing cycle: {formatDate(p.billingStartDate)} – {formatDate(p.billingEndDate)} • Paid on {formatDate(p.paymentDate)}
                </div>

                {p.transactionRef && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    Ref / UTR: {p.transactionRef}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedReceipt(p)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" />
                <span>View / Print Receipt</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        payment={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
