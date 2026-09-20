'use client';

import React, { useState } from 'react';
import { useAuth } from '../../stores/auth-context';
import { useUI } from '../../stores/ui-context';
import { DocuCraftLogo } from '../brand/DocuCraftLogo';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';

export function AuthModal() {
  const { authModalOpen, closeAuthModal, onAuthSuccess, addToast } = useUI();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        await signup({ name, email, password });
        addToast('Account created successfully!', 'success');
      } else {
        await login({ email, password });
        addToast('Welcome back!', 'success');
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setMode('login');
    setEmail('demo@docucraft.io');
    setPassword('DemoPassword123!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-dock border border-paper-border overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-paper-sand border-b border-paper-border flex items-center justify-between">
          <DocuCraftLogo size="sm" />
          <button
            onClick={closeAuthModal}
            className="p-1 rounded text-ink-400 hover:text-ink-900 hover:bg-paper-card transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-ink-900">
              {mode === 'signup' ? 'Save & Export Your Document' : 'Sign In to Continue'}
            </h2>
            <p className="text-xs text-ink-500 mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Create an account to download publication-grade PDFs and persist your document drafts.'
                : 'Log in with your existing account to unlock download authorization.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-paper-sand border border-paper-border rounded-md mb-6">
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
                mode === 'signup'
                  ? 'bg-white text-ink-900 shadow-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${
                mode === 'login'
                  ? 'bg-white text-ink-900 shadow-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">
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
                    className="w-full pl-9 pr-3 py-2 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-paper-border bg-paper-warm text-sm text-ink-900 focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs transition-all shadow-paper flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Processing...' : mode === 'signup' ? 'Complete & Download' : 'Sign In & Download'}</span>
              <ArrowRight size={13} className="text-brand-orange" />
            </button>
          </form>

          {/* Demo account quick login helper */}
          <div className="mt-4 pt-4 border-t border-paper-border text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-ink-500 hover:text-ink-900 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <span>Use Demo Account (demo@docucraft.io)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
