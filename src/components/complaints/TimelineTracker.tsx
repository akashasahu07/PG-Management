'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { formatDate } from '@/lib/due-date';

interface StatusHistoryItem {
  id: string;
  oldStatus: string;
  newStatus: string;
  comment?: string | null;
  changedBy: string;
  createdAt: string | Date;
}

interface TimelineTrackerProps {
  currentStatus: string;
  history?: StatusHistoryItem[];
}

const STAGES = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

export function TimelineTracker({ currentStatus, history = [] }: TimelineTrackerProps) {
  const currentIndex = STAGES.findIndex((s) => s.key === currentStatus.toUpperCase());
  const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="space-y-6">
      {/* Horizontal Steps on desktop */}
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 transition-all duration-500 z-0"
          style={{
            width: `${(effectiveIndex / (STAGES.length - 1)) * 100}%`,
          }}
        />

        {STAGES.map((stage, idx) => {
          const isDone = idx < effectiveIndex;
          const isCurrent = idx === effectiveIndex;

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isCurrent
                    ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 shadow-md shadow-sky-500/40 animate-pulse-subtle'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                  isCurrent
                    ? 'text-sky-600 dark:text-sky-400 font-bold'
                    : isDone
                    ? 'text-slate-700 dark:text-slate-300'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* History Log */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Activity History & Remarks
          </h5>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Status changed to <span className="text-indigo-600 dark:text-indigo-400 font-bold">{item.newStatus}</span>
                  </div>
                  {item.comment && (
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{item.comment}</p>
                  )}
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Updated by {item.changedBy}
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                  {formatDate(item.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
