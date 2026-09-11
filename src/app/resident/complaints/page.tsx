'use client';

import React, { useState, useEffect } from 'react';
import { LifeBuoy, Plus, CheckCircle2, Clock, AlertCircle, X, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/due-date';
import { TimelineTracker } from '@/components/complaints/TimelineTracker';

export default function ResidentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('Room Maintenance');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowForm(false);
    };
    if (showForm) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showForm]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
      if (!res.ok) throw new Error('Failed to load complaints');
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!subject.trim() || !description.trim()) {
      setFormError('Please provide a subject and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject, description, priority }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit complaint.');

      setSuccessTicket(data.complaint.ticketId);
      setSubject('');
      setDescription('');
      setShowForm(false);
      fetchComplaints();
    } catch (err: any) {
      setFormError(err.message || 'Error lodging complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            <span>Complaints & Maintenance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit issues for room fixtures, electrical, plumbing, or Wi-Fi and track live status
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setSuccessTicket(null);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File New Complaint</span>
        </button>
      </div>

      {/* Success Notification Banner */}
      {successTicket && (
        <div className="p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-start justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Complaint Submitted Successfully! 🎉</div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Ticket ID: <strong className="font-mono text-slate-900 dark:text-white">{successTicket}</strong>. Our staff will attend to your request shortly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSuccessTicket(null)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Complaints List with Real-time Timeline */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-7 h-7 text-sky-600 dark:text-sky-500 animate-spin" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Loading your tickets...</span>
        </div>
      ) : complaints.length === 0 ? (
        <div className="py-20 text-center space-y-2 p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <LifeBuoy className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Open Complaints 🎉</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Looks like everything in your room is running smoothly!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((c) => {
            const isResolved = c.status === 'RESOLVED' || c.status === 'CLOSED';

            return (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-6 shadow-sm dark:shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {c.ticketId}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{c.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{c.subject}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                      isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        : 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.description}
                </p>

                {/* Animated Lifecycle Timeline */}
                <div className="pt-2">
                  <TimelineTracker currentStatus={c.status} history={c.statusHistory} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lodge Complaint Modal */}
      {showForm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>File a Maintenance Complaint</span>
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Room Maintenance">Room Maintenance</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Wi-Fi">Wi-Fi</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Furniture">Furniture</option>
                    <option value="AC/Fan">AC/Fan</option>
                    <option value="Security">Security</option>
                    <option value="Noise">Noise</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geyser not heating water properly"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide any helpful details for the maintenance technician..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
