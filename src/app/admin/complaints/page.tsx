'use client';

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/due-date';
import { TimelineTracker } from '@/components/complaints/TimelineTracker';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Selected ticket for timeline view or status update
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedTicket(null);
    };
    if (selectedTicket) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedTicket]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load complaints');
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newStatus) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/complaints/${selectedTicket.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus, comment: statusComment }),
      });

      if (!res.ok) throw new Error('Failed to update status.');
      const data = await res.json();
      setSelectedTicket(data.complaint);
      setStatusComment('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <LifeBuoy className="w-7 h-7 text-sky-500" />
          <span>Complaint & Maintenance Tickets</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Review issues lodged by residents, assign technician teams, and track resolution workflows
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
          >
            <option value="">All Categories</option>
            <option value="Room Maintenance">Room Maintenance</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Furniture">Furniture</option>
            <option value="AC/Fan">AC/Fan</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {complaints.length} Total Tickets
        </span>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading complaints queue...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-16 text-center space-y-2 p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">All Clear! No Open Complaints</h3>
          <p className="text-xs text-slate-500">
            Hostel operations and room maintenance are running smoothly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {complaints.map((c) => {
            const isResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';

            return (
              <div
                key={c.id}
                onClick={() => {
                  setSelectedTicket(c);
                  setNewStatus(c.status);
                  setStatusComment('');
                }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none backdrop-blur-md cursor-pointer transition-all hover:scale-[1.01] space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        c.priority === 'URGENT' || c.priority === 'HIGH'
                          ? 'bg-rose-500 animate-ping'
                          : c.priority === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {c.priority} Priority • {c.category}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isResolved
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                    {c.subject}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{c.resident?.name}</span>
                    <span>(Room {c.resident?.room?.roomNumber})</span>
                  </div>
                  <span className="font-mono text-[11px]">{c.ticketId}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Details & Lifecycle Drawer / Modal */}
      {selectedTicket && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTicket(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {selectedTicket.ticketId}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{selectedTicket.category}</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedTicket.subject}</h2>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Resident Info & Description */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    Lodged by: <strong className="text-slate-800 dark:text-white">{selectedTicket.resident?.name}</strong> (Room {selectedTicket.resident?.room?.roomNumber}, Bed #{selectedTicket.resident?.bed?.bedNumber})
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Status Timeline */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  Resolution Progress Workflow
                </h4>
                <TimelineTracker
                  currentStatus={selectedTicket.status}
                  history={selectedTicket.statusHistory}
                />
              </div>

              {/* Admin Action: Change Status */}
              <form onSubmit={handleUpdateStatus} className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Update Ticket Status
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">New Workflow Stage</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="ASSIGNED">Assigned (Technician Dispatched)</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Audit Remarks (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Electrician scheduled for 3 PM"
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating || newStatus === selectedTicket.status}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-md"
                  >
                    {updating ? 'Saving...' : 'Update Ticket Stage'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
