'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Sparkles, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/due-date';
import { generateResidentId } from '@/lib/id-generator';

interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResidentAdded: () => void;
  initialRoomId?: string;
  initialBedId?: string;
}

export function AddResidentModal({
  isOpen,
  onClose,
  onResidentAdded,
  initialRoomId,
  initialBedId,
}: AddResidentModalProps) {
  const [floors, setFloors] = useState<any[]>([]);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedFloorCode, setSelectedFloorCode] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || '');
  const [selectedBedId, setSelectedBedId] = useState(initialBedId || '');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthlyRent, setMonthlyRent] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      fetchFloors();
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

  const fetchFloors = async () => {
    setLoadingFloors(true);
    try {
      const res = await fetch('/api/admin/floors');
      const data = await res.json();
      if (data.floors) {
        setFloors(data.floors);
        if (data.floors[0] && !selectedFloorCode) {
          setSelectedFloorCode(data.floors[0].code);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFloors(false);
    }
  };

  const activeFloor = floors.find((f) => f.code === selectedFloorCode);
  const availableRooms = activeFloor ? activeFloor.rooms : [];
  const activeRoom = availableRooms.find((r: any) => r.id === selectedRoomId);
  const availableBeds = activeRoom
    ? activeRoom.beds.filter((b: any) => b.status === 'AVAILABLE')
    : [];

  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId);
    setSelectedBedId('');
    const room = availableRooms.find((r: any) => r.id === roomId);
    if (room) {
      setMonthlyRent(room.monthlyRent);
      const firstFreeBed = room.beds.find((b: any) => b.status === 'AVAILABLE');
      if (firstFreeBed) {
        setSelectedBedId(firstFreeBed.id);
      }
    }
  };

  const previewId = activeRoom
    ? generateResidentId(activeRoom.roomNumber, 1) + ' (Est.)'
    : 'EH-A01-001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !selectedRoomId || !selectedBedId || !joiningDate) {
      setError('Please fill in all required accommodation and personal details.');
      return;
    }

    if (phone.trim().length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          roomId: selectedRoomId,
          bedId: selectedBedId,
          joiningDate,
          monthlyRent: monthlyRent ? Number(monthlyRent) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add resident.');
      }

      onResidentAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Resident</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Allocate room, bed, and auto-generate unique Resident ID</p>
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

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Floor & Room Selection */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Accommodation Allocation
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Floor</label>
                <select
                  value={selectedFloorCode}
                  onChange={(e) => {
                    setSelectedFloorCode(e.target.value);
                    setSelectedRoomId('');
                    setSelectedBedId('');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                >
                  {floors.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Room</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => handleRoomChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="">Select Room</option>
                  {availableRooms.map((r: any) => {
                    const freeCount = r.beds.filter((b: any) => b.status === 'AVAILABLE').length;
                    return (
                      <option key={r.id} value={r.id} disabled={freeCount === 0}>
                        {r.roomNumber} ({freeCount} beds free)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Bed Slot</label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  disabled={!selectedRoomId}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none disabled:opacity-50"
                >
                  <option value="">Select Bed</option>
                  {availableBeds.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      Bed #{b.bedNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stay Dates & Rent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Joining Date *
              </label>
              <input
                type="date"
                required
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Monthly Rent (₹)
              </label>
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder={activeRoom ? activeRoom.monthlyRent.toString() : 'Auto'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Auto ID Generation Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-600 dark:text-slate-400">System generated Resident ID preview: </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{previewId}</span>
            </div>
          </div>

          {/* Submit buttons */}
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <span>Complete Onboarding</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
