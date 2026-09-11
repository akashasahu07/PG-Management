'use client';

import React, { useEffect } from 'react';
import { Printer, Building2, CheckCircle2, ShieldCheck, Download, X } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/due-date';

interface ReceiptCardProps {
  payment: {
    id: string;
    paymentId: string;
    amount: number;
    paymentDate: string | Date;
    billingStartDate: string | Date;
    billingEndDate: string | Date;
    paymentMethod: string;
    transactionRef?: string | null;
    status: string;
    receiptNotes?: string | null;
    resident: {
      id: string;
      residentId: string;
      name: string;
      phone: string;
      joiningDate: string | Date;
      room: {
        roomNumber: string;
        sharingCapacity: number;
        floor: {
          displayName: string;
        };
      };
      bed: {
        bedNumber: number;
      };
    };
  };
  onClose?: () => void;
  showPrintActions?: boolean;
}

export function ReceiptCard({
  payment,
  onClose,
  showPrintActions = true,
}: ReceiptCardProps) {
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="printable-receipt bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto text-slate-900 dark:text-slate-100 transition-colors relative">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between pb-5 mb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified Digital Receipt</span>
        </div>
        <div className="flex items-center gap-2">
          {showPrintActions && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Close Receipt (Esc)"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      {/* Official Receipt Header */}
      <div className="flex items-start justify-between border-b-2 border-indigo-500/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              ELITE HOMES
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Hostel & PG Accommodation Management
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {payment.status}
          </span>
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mt-2">
            {payment.paymentId}
          </div>
          <div className="text-[11px] text-slate-500">
            Date: {formatDate(payment.paymentDate)}
          </div>
        </div>
      </div>

      {/* Resident & Accommodation Details */}
      <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Billed To
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {payment.resident.name}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Phone: {payment.resident.phone}
          </div>
          <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
            Resident ID: {payment.resident.residentId}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
            Accommodation Details
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
            Room {payment.resident.room.roomNumber} (Bed #{payment.resident.bed.bedNumber})
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {payment.resident.room.floor.displayName} • {payment.resident.room.sharingCapacity}-Sharing
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Joined: {formatDate(payment.resident.joiningDate)}
          </div>
        </div>
      </div>

      {/* Line Item Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 my-6">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Billing Period</th>
              <th className="p-3.5">Mode</th>
              <th className="p-3.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            <tr>
              <td className="p-3.5 font-medium">
                Monthly Rent Accommodation
                {payment.receiptNotes && (
                  <div className="text-[11px] text-slate-500 italic mt-0.5">
                    Note: {payment.receiptNotes}
                  </div>
                )}
              </td>
              <td className="p-3.5 text-slate-600 dark:text-slate-300">
                {formatDate(payment.billingStartDate)} – {formatDate(payment.billingEndDate)}
              </td>
              <td className="p-3.5 font-mono">
                {payment.paymentMethod}
                {payment.transactionRef && (
                  <div className="text-[10px] text-slate-500">Ref: {payment.transactionRef}</div>
                )}
              </td>
              <td className="p-3.5 text-right font-bold text-sm text-slate-900 dark:text-white">
                {formatCurrency(payment.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total & Confirmation Stamp */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Payment Received & Cleared
            </div>
            <div className="text-[11px] text-slate-400">Thank you for staying at Elite Homes</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Total Paid
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            {formatCurrency(payment.amount)}
          </div>
        </div>
      </div>

      {/* Signature & System stamp footer */}
      <div className="mt-8 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-end justify-between">
        <div>
          <p>Elite Homes PG Accommodation, Main Road.</p>
          <p>This is a computer-generated receipt and requires no physical signature.</p>
        </div>
        <div className="text-center">
          <div className="w-28 border-b border-slate-400 dark:border-slate-600 pb-1 mb-1 font-signature text-slate-600 dark:text-slate-300">
            Elite Homes PG
          </div>
          <span>Authorized Signatory</span>
        </div>
      </div>

      {/* Bottom Dismiss Bar */}
      {onClose && (
        <div className="no-print pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <X className="w-4 h-4" />
            <span>Close Receipt</span>
          </button>
        </div>
      )}
    </div>
  );
}
