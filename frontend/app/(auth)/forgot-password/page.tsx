'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authClient.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-surface text-brand-charcoal flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-brand-border p-8 shadow-soft">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-orange to-brand-yellow flex items-center justify-center text-white font-bold font-display shadow-sm">
              D
            </div>
            <span className="font-bold font-display text-lg tracking-tight">DocuCraft</span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-brand-charcoal">Reset Your Password</h1>
          <p className="text-xs text-brand-muted mt-1">
            Enter your email to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-brand-charcoal">
              Check your email inbox
            </p>
            <p className="text-xs text-brand-muted leading-relaxed">
              If an account is associated with {email}, we've sent password reset instructions.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-orange hover:underline pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-orange to-brand-coral text-white font-bold text-sm shadow-md shadow-brand-orange/20 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {loading ? <span>Sending...</span> : <span>Send Reset Instructions</span>}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-charcoal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
