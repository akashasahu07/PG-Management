'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';

export default function StandaloneReceiptPage({
  params: initialParams,
}: {
  params?: { id: string };
}) {
  const routeParams = useParams();
  const paymentId = (routeParams?.id as string) || initialParams?.id || '';
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const fetchPayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/${paymentId}`);
      if (!res.ok) throw new Error('Receipt not found or unauthorized.');
      const data = await res.json();
      setPayment(data.payment);
    } catch (err: any) {
      setError(err.message || 'Failed to load receipt.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 dark:text-slate-400">Loading official receipt...</span>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 text-center space-y-4">
        <p className="text-sm text-rose-500 dark:text-rose-400">{error || 'Receipt not found.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto mb-4 no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elite Homes</span>
        </Link>
      </div>

      <ReceiptCard payment={payment} showPrintActions={true} />
    </div>
  );
}
