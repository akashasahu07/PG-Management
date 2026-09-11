'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  CreditCard,
  LifeBuoy,
  History,
  LogOut,
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Printer,
  Loader2,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/due-date';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';

export default function ResidentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [resident, setResident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  // Transfer State
  const [floors, setFloors] = useState<any[]>([]);
  const [transferFloor, setTransferFloor] = useState('');
  const [transferRoomId, setTransferRoomId] = useState('');
  const [transferBedId, setTransferBedId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferring, setTransferring] = useState(false);

  // Checkout State
  const [checkoutReason, setCheckoutReason] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchResident();
  }, [params.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTransferModal(false);
        setShowCheckoutModal(false);
        setShowPayModal(false);
        setSelectedReceipt(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchResident = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/residents/${params.id}`);
      if (!res.ok) throw new Error('Resident not found.');
      const data = await res.json();
      setResident(data.resident);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const loadFloorsForTransfer = async () => {
    try {
      const res = await fetch('/api/admin/floors');
      const data = await res.json();
      if (data.floors) {
        setFloors(data.floors);
        if (data.floors[0]) setTransferFloor(data.floors[0].code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTransfer = () => {
    loadFloorsForTransfer();
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRoomId || !transferBedId) return;

    setTransferring(true);
    try {
      const res = await fetch(`/api/admin/residents/${params.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newRoomId: transferRoomId,
          newBedId: transferBedId,
          reason: transferReason.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to transfer room.');
      }

      setShowTransferModal(false);
      fetchResident();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleExecuteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckingOut(true);
    try {
      const res = await fetch(`/api/admin/residents/${params.id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: checkoutReason.trim() || undefined }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Failed to checkout resident.');
      }

      setShowCheckoutModal(false);
      fetchResident();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading resident profile...</span>
      </div>
    );
  }

  if (error || !resident) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-rose-500">{error || 'Resident not found'}</p>
        <Link
          href="/admin/residents"
          className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  const activeFloor = floors.find((f) => f.code === transferFloor);
  const availableRooms = activeFloor ? activeFloor.rooms : [];
  const selectedRoom = availableRooms.find((r: any) => r.id === transferRoomId);
  const availableBeds = selectedRoom
    ? selectedRoom.beds.filter((b: any) => b.status === 'AVAILABLE')
    : [];

  const rentStatus = resident.rentStatus?.status || 'PENDING';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/admin/residents"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Residents Directory</span>
        </Link>
      </div>

      {/* Main Resident Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xl font-bold shadow-xl shadow-indigo-500/25 shrink-0">
              {resident.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{resident.name}</h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    resident.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {resident.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{resident.residentId}</span>
                <span>•</span>
                <a
                  href={`tel:${resident.phone}`}
                  className="hover:text-indigo-600 dark:hover:text-white flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium"
                >
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{resident.phone}</span>
                </a>
                <span>•</span>
                <span>Joined {formatDate(resident.joiningDate)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons for Active Resident */}
          {resident.status === 'ACTIVE' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowPayModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Record Rent</span>
              </button>

              <button
                onClick={handleOpenTransfer}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-sky-500" />
                <span>Transfer</span>
              </button>

              <button
                onClick={() => setShowCheckoutModal(true)}
                className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Checkout</span>
              </button>
            </div>
          )}
        </div>

        {/* Accommodation & Rent Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Room & Bed</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              Room {resident.room?.roomNumber} • Bed #{resident.bed?.bedNumber}
            </div>
            <div className="text-[11px] text-slate-500">
              {resident.room?.sharingCapacity}-Sharing ({resident.room?.floor?.displayName})
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Monthly Rent</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(resident.monthlyRent)}
            </div>
            <div className="text-[11px] text-slate-500">Per monthly cycle</div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Due Status</div>
            <div className="mt-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                  rentStatus === 'OVERDUE'
                    ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30'
                    : rentStatus === 'DUE_TODAY'
                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                    : 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                }`}
              >
                {rentStatus === 'OVERDUE' ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span>{rentStatus.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Next Rent Due</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {resident.rentStatus?.dueDate ? formatDate(resident.rentStatus.dueDate) : '—'}
            </div>
            {resident.rentStatus?.daysRemaining !== undefined && (
              <div className="text-[11px] text-slate-500">
                {resident.rentStatus.daysRemaining > 0
                  ? `${resident.rentStatus.daysRemaining} days remaining`
                  : resident.rentStatus.daysRemaining === 0
                  ? 'Due today'
                  : `${Math.abs(resident.rentStatus.daysRemaining)} days overdue`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Payment History & Invoices</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {resident.payments?.length || 0} Records
          </span>
        </div>

        {resident.payments && resident.payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Receipt ID</th>
                  <th className="p-3.5">Payment Date</th>
                  <th className="p-3.5">Billing Period</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {resident.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{p.paymentId}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">{formatDate(p.paymentDate)}</td>
                    <td className="p-3.5 text-slate-500 dark:text-slate-400">
                      {formatDate(p.billingStartDate)} – {formatDate(p.billingEndDate)}
                    </td>
                    <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">{p.paymentMethod}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() =>
                          setSelectedReceipt({
                            ...p,
                            resident: {
                              id: resident.id,
                              residentId: resident.residentId,
                              name: resident.name,
                              phone: resident.phone,
                              joiningDate: resident.joiningDate,
                              room: resident.room,
                              bed: resident.bed,
                            },
                          })
                        }
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No payments recorded yet.</p>
        )}
      </div>

      {/* Complaint Tickets */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-sky-500" />
          <span>Complaints & Tickets Lodged</span>
        </h2>

        {resident.complaints && resident.complaints.length > 0 ? (
          <div className="space-y-3">
            {resident.complaints.map((c: any) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{c.subject}</div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      c.status === 'RESOLVED' || c.status === 'CLOSED'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{c.description}</p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                  <span>Category: {c.category} • Priority: {c.priority}</span>
                  <span className="font-mono">{c.ticketId} • {formatDate(c.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">No complaints lodged.</p>
        )}
      </div>

      {/* Room Transfer History */}
      {resident.transfers && resident.transfers.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-500" />
            <span>Room Transfer History</span>
          </h2>
          <div className="space-y-2">
            {resident.transfers.map((t: any) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">
                    Transferred from Room {t.oldRoomNumber} (Bed #{t.oldBedNumber}) &rarr; Room{' '}
                    {t.newRoomNumber} (Bed #{t.newBedNumber})
                  </span>
                  {t.reason && <p className="text-slate-500 text-[11px] mt-0.5">Reason: {t.reason}</p>}
                </div>
                <span className="text-[11px] text-slate-500">{formatDate(t.transferDate)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTransferModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-sky-500" />
                <span>Transfer Resident Room</span>
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Transferring <strong>{resident.name}</strong> from current Room {resident.room?.roomNumber}, Bed #{resident.bed?.bedNumber}.
              </p>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">Target Floor</label>
                <select
                  value={transferFloor}
                  onChange={(e) => {
                    setTransferFloor(e.target.value);
                    setTransferRoomId('');
                    setTransferBedId('');
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {floors.map((f) => (
                    <option key={f.code} value={f.code}>{f.displayName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">Target Room</label>
                <select
                  value={transferRoomId}
                  onChange={(e) => {
                    setTransferRoomId(e.target.value);
                    setTransferBedId('');
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value="">Select Room</option>
                  {availableRooms.map((r: any) => {
                    const freeCount = r.beds.filter((b: any) => b.status === 'AVAILABLE').length;
                    return (
                      <option key={r.id} value={r.id} disabled={freeCount === 0}>
                        {r.roomNumber} ({freeCount} available beds)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">Target Bed Slot</label>
                <select
                  value={transferBedId}
                  onChange={(e) => setTransferBedId(e.target.value)}
                  disabled={!transferRoomId}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none disabled:opacity-50"
                >
                  <option value="">Select Bed</option>
                  {availableBeds.map((b: any) => (
                    <option key={b.id} value={b.id}>Bed #{b.bedNumber}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">Transfer Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Resident requested lower floor / AC preference"
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring || !transferBedId}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {transferring ? 'Processing...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCheckoutModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LogOut className="w-5 h-5 text-rose-500" />
                <span>Checkout Resident</span>
              </h3>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to mark <strong>{resident.name}</strong> as checked out? Their bed slot in Room {resident.room?.roomNumber} will immediately become available for new allocation.
            </p>

            <form onSubmit={handleExecuteCheckout} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-400 mb-1">Reason for Leaving</label>
                <input
                  type="text"
                  placeholder="e.g. Job transfer / Course completed"
                  value={checkoutReason}
                  onChange={(e) => setCheckoutReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkingOut}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {checkingOut ? 'Checking out...' : 'Confirm Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showPayModal}
        initialResidentId={resident.id}
        onClose={() => setShowPayModal(false)}
        onPaymentRecorded={(p) => {
          fetchResident();
          setSelectedReceipt({
            ...p,
            resident: {
              id: resident.id,
              residentId: resident.residentId,
              name: resident.name,
              phone: resident.phone,
              joiningDate: resident.joiningDate,
              room: resident.room,
              bed: resident.bed,
            },
          });
        }}
      />

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedReceipt(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
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
