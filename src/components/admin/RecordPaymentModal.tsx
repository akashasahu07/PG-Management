'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { computeResidentRentStatus } from '@/lib/due-date';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: (payment: any) => void;
  initialResidentId?: string;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  onPaymentRecorded,
  initialResidentId,
}: RecordPaymentModalProps) {
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState(initialResidentId || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [billingStartDate, setBillingStartDate] = useState('');
  const [billingEndDate, setBillingEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptNotes, setReceiptNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchResidents();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const fetchResidents = async () => {
    try {
      const res = await fetch('/api/admin/residents?status=ACTIVE');
      const data = await res.json();
      if (data.residents) {
        setResidents(data.residents);
        if (initialResidentId) {
          handleResidentSelect(initialResidentId, data.residents);
        } else if (data.residents[0]) {
          handleResidentSelect(data.residents[0].id, data.residents);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResidentSelect = (residentDbId: string, list = residents) => {
    setSelectedResidentId(residentDbId);
    const r = list.find((item: any) => item.id === residentDbId);
    if (r) {
      setAmount(r.monthlyRent);
      const latestPay = r.payments && r.payments[0] ? r.payments[0].paymentDate : null;
      const cycle = computeResidentRentStatus(r.joiningDate, latestPay);
      setBillingStartDate(cycle.startDate.toISOString().split('T')[0]);
      setBillingEndDate(cycle.endDate.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedResidentId || !amount || !paymentDate || !billingStartDate || !billingEndDate) {
      setError('Please fill in all mandatory payment and billing period fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          residentId: selectedResidentId,
          amount: Number(amount),
          paymentDate,
          billingStartDate,
          billingEndDate,
          paymentMethod,
          transactionRef: transactionRef.trim() || undefined,
          receiptNotes: receiptNotes.trim() || undefined,
          status: 'PAID',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment.');
      }

      onPaymentRecorded(data.payment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Rent Payment</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Issue official receipt and update billing period</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Select Resident */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Resident *
            </label>
            <select
              value={selectedResidentId}
              onChange={(e) => handleResidentSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
            >
              <option value="">Select a resident</option>
              {residents.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.residentId}) — Room {r.room?.roomNumber}, Bed {r.bed?.bedNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Amount Paid (₹) *
              </label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="5000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Billing Cycle Range */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Billing Period (Rent Cycle) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">From</span>
                <input
                  type="date"
                  required
                  value={billingStartDate}
                  onChange={(e) => setBillingStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">To</span>
                <input
                  type="date"
                  required
                  value={billingEndDate}
                  onChange={(e) => setBillingEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
              >
                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer / NEFT / IMPS</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Reference / UTR #
              </label>
              <input
                type="text"
                placeholder="Optional (e.g. UPI Ref #)"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Receipt Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Includes maintenance fee / advance rent"
              value={receiptNotes}
              onChange={(e) => setReceiptNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <span>Record & Generate Receipt</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
