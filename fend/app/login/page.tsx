'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Heart, KeyRound, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'email' | 'otp' | 'reset'>('email');

  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);

  // Password reset state
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetPreview, setResetPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/auth/login', { email, password });
      await refreshUser();
      toast.success('Welcome back to SAKHI');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/otp', { phone });
      setOtpSent(true);
      setOtpPreview(res.previewCode || null);
      toast.success('6-digit OTP generated (valid for 10 min)');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.fetch('/api/auth/otp', {
        method: 'PUT',
        body: JSON.stringify({ phone, code: otpCode }),
      });
      await refreshUser();
      toast.success('Phone verified & signed in');
      router.push('/');
    } catch (err: any) {
      toast.error(err?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/api/auth/password-reset', { email: resetEmail });
      setResetSent(true);
      setResetPreview(res.previewCode || null);
      toast.success('Reset instructions ready');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start password reset');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.fetch('/api/auth/password-reset', {
        method: 'PUT',
        body: JSON.stringify({ email: resetEmail, code: resetCode, newPassword }),
      });
      toast.success('Password updated! Please sign in.');
      setMode('email');
      setEmail(resetEmail);
      setPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-teal-50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-rose-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow">
            <Heart className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sign in to <span className="text-rose-600">SAKHI</span>
          </h1>
          <p className="text-sm text-slate-600">
            Women’s health tracking, clinical reports, & compassionate care
          </p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          className="gsi-material-button w-full flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          <span className="gsi-material-button-icon h-5 w-5 shrink-0">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block h-5 w-5">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
          </span>
          <span className="gsi-material-button-contents">Sign in with Google</span>
        </button>

        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`flex items-center justify-center gap-1 rounded-md py-2 ${
              mode === 'email' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            className={`flex items-center justify-center gap-1 rounded-md py-2 ${
              mode === 'otp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Phone OTP
          </button>
          <button
            type="button"
            onClick={() => setMode('reset')}
            className={`flex items-center justify-center gap-1 rounded-md py-2 ${
              mode === 'reset' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-500"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Mobile Number (with country code)</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="+919876543210"
                />
                <Button type="button" variant="outline" disabled={loading || !phone} onClick={handleSendOtp}>
                  {otpSent ? 'Resend' : 'Send OTP'}
                </Button>
              </div>
            </div>

            {otpPreview && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Verification code (preview): <strong className="font-mono">{otpPreview}</strong>
              </div>
            )}

            {otpSent && (
              <>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tracking-widest outline-none focus:ring-2 focus:ring-rose-200"
                    placeholder="123456"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </>
            )}
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Account Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="you@example.com"
                />
                <Button type="button" variant="outline" disabled={loading || !resetEmail} onClick={handleRequestReset}>
                  Send Code
                </Button>
              </div>
            </div>

            {resetPreview && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                Reset code (preview): <strong className="font-mono">{resetPreview}</strong>
              </div>
            )}

            {resetSent && (
              <>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                  placeholder="6-digit reset code"
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="New password (min 6 chars)"
                />
                <Button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                  Update Password
                </Button>
              </>
            )}
          </form>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-600">
          <button type="button" onClick={() => router.push('/anonymous-chat')} className="text-teal-700 font-medium hover:underline">
            Anonymous Support (No Login)
          </button>
          <button type="button" onClick={() => router.push('/signup')} className="text-rose-600 font-medium hover:underline">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
