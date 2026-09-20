'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../stores/auth-context';
import { useUI } from '../../../stores/ui-context';
import { DocuCraftLogo } from '../../../components/brand/DocuCraftLogo';
import { DocumentPreview } from '../../../components/preview/DocumentPreview';
import { TEMPLATES } from '@docucraft/shared';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { addToast } = useUI();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) throw new Error('Please enter your full name');
      await signup({ name, email, password });
      addToast('Account created successfully!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper-warm text-ink-900 flex font-sans">
      {/* Left Column: Visual Document Preview (Editorial Studio) */}
      <div className="hidden lg:flex lg:w-1/2 bg-paper-sand border-r border-paper-border p-12 flex-col justify-between items-center relative overflow-hidden">
        <div className="w-full flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <DocuCraftLogo size="sm" />
          </Link>
          <span className="text-[11px] font-mono text-ink-400">STUDIO MEMBERSHIP</span>
        </div>

        <div className="w-full max-w-[340px] my-auto">
          <div className="mb-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              Executive Resume Template
            </span>
          </div>
          <DocumentPreview template={TEMPLATES[4]} mode="thumbnail" shadow={true} hoverLift={false} />
        </div>

        <div className="w-full max-w-md text-center text-xs text-ink-500 italic">
          "Create publications that represent your highest standards of clarity and precision."
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden mb-6">
              <Link href="/">
                <DocuCraftLogo size="sm" />
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">
              Create Your Account
            </h1>
            <p className="text-xs text-ink-500 mt-1.5 leading-relaxed">
              Start creating, saving, and downloading professional-grade vector documents.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Eleanor Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs transition-all shadow-paper flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={13} className="text-brand-orange" />
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-orange font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
