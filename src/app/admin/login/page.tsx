'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/ui/Navbar';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Loader2,
  KeyRound,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLoginPage() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [registeredAdmin, setRegisteredAdmin] = useState<{
    username: string;
    name: string;
  } | null>(null);

  // Active View Mode: 'login' | 'setup' | 'reset'
  const [mode, setMode] = useState<'login' | 'setup' | 'reset'>('login');

  // Login Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Setup Form
  const [name, setName] = useState('');
  const [setupUsername, setSetupUsername] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');

  // Reset Form
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await fetch('/api/auth/admin/setup');
      const data = await res.json();
      setIsSetup(data.isSetup);
      if (data.isSetup) {
        setMode('login');
        if (data.adminUsername) {
          setUsername(data.adminUsername);
          setRegisteredAdmin({
            username: data.adminUsername,
            name: data.adminName || 'Owner',
          });
        }
      } else {
        setMode('setup');
      }
    } catch {
      setIsSetup(true);
      setMode('login');
    } finally {
      setCheckingSetup(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (setupPassword !== setupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (setupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: setupUsername.trim(),
          password: setupPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin account.');
      }

      window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.message || 'Setup error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetPassword !== resetConfirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (resetPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username || registeredAdmin?.username,
          newPassword: resetPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess('Master password reset successfully! Logging you in...');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Reset error.');
    } finally {
      setLoading(false);
    }
  };

  const handleReinit = async () => {
    if (
      !window.confirm(
        'Are you sure you want to reset your Master Admin account? You will be prompted to create your credentials from scratch.'
      )
    ) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/admin/reinit', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset administrator account.');

      setIsSetup(false);
      setRegisteredAdmin(null);
      setMode('setup');
      setUsername('');
      setPassword('');
      setName('');
      setSetupUsername('');
      setSetupPassword('');
      setSetupConfirmPassword('');
      setSuccess('Master account cleared. You may now create a new master administrator from scratch.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden transition-colors">
      <div className="liquid-blob-1 top-[-80px] right-[-100px]" />
      <div className="liquid-blob-2 bottom-[-100px] left-[-80px]" />

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl backdrop-blur-xl transition-colors">
          {checkingSetup ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Verifying security configuration...
              </span>
            </div>
          ) : mode === 'setup' ? (
            /* First-Time Master Setup Form */
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-xl shadow-indigo-500/25 mb-3 border border-slate-200/80 dark:border-slate-700/80 bg-white p-1 flex items-center justify-center">
                  <img src="/logo.png" alt="Elite Homes Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
                  Initial Setup
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Master Admin
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Configure your private administrator account. This will be the only account authorized to manage Elite Homes.
                </p>
              </div>

              <form onSubmit={handleSetup} className="space-y-3.5">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Desired Admin Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. akash7070"
                    value={setupUsername}
                    onChange={(e) => setSetupUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password (Min. 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={setupConfirmPassword}
                    onChange={(e) => setSetupConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup & Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : mode === 'reset' ? (
            /* Reset Master Password Form */
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-amber-500/30 mb-3">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Reset Master Password
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Enter a new secure password for{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {registeredAdmin?.name || 'Administrator'}
                  </span>{' '}
                  ({registeredAdmin?.username || username})
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3.5">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (Min. 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs shadow-xl shadow-amber-600/25 flex items-center justify-center gap-2 transition-all mt-3 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Save New Password & Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    &larr; Back to Regular Sign In
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Regular Secure Owner Login Form */
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto shadow-xl shadow-indigo-500/25 mb-3 border border-slate-200/80 dark:border-slate-700/80 bg-white p-1 flex items-center justify-center">
                  <img src="/logo.png" alt="Elite Homes Logo" className="w-full h-full object-cover rounded-xl" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Admin Sign In
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Private management portal for Elite Homes
                </p>

                {registeredAdmin && (
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-medium">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    <span>
                      Registered Master: <strong>{registeredAdmin.name}</strong> (@{registeredAdmin.username})
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Admin Username or Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Username or Name (e.g. akash7070 or Akash)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        setError('');
                        setSuccess('');
                      }}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Reset Master Password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Reset Account Option */}
              <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-center space-y-2">
                <button
                  type="button"
                  onClick={handleReinit}
                  className="text-[11px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 inline-flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Start Fresh / Recreate Master Admin Account</span>
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              &larr; Back to Resident Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
