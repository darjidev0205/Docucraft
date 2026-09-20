'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth-context';
import { apiClient } from '../../lib/api-client';
import {
  Users,
  FileText,
  Download,
  LayoutTemplate,
  Shield,
  Clock,
  ChevronLeft,
  Loader2,
  Activity,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [docsList, setDocsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'documents'>('overview');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
      return;
    }

    if (user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [user, authLoading]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsData, usersData, docsData] = await Promise.all([
        apiClient.get<any>('/admin/stats'),
        apiClient.get<any>('/admin/users'),
        apiClient.get<any>('/admin/documents'),
      ]);
      setStats(statsData);
      setUsersList(usersData.users || []);
      setDocsList(docsData.documents || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-brand-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col text-brand-charcoal">
      {/* Header */}
      <header className="h-16 bg-white border-b border-brand-border px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-1 text-xs font-semibold text-brand-muted hover:text-brand-charcoal">
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-orange" />
            <span className="font-bold text-sm">DocuCraft Admin Hub</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'overview' ? 'bg-brand-cream text-brand-charcoal' : 'text-slate-500'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'users' ? 'bg-brand-cream text-brand-charcoal' : 'text-slate-500'
            }`}
          >
            Users ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'documents' ? 'bg-brand-cream text-brand-charcoal' : 'text-slate-500'
            }`}
          >
            Documents ({docsList.length})
          </button>
        </div>
      </header>

      {/* Admin Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold font-display">System Overview & Analytics</h1>
              <p className="text-xs text-brand-muted mt-0.5">Real-time metrics from the production database.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-muted">Total Users</span>
                  <Users className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="text-2xl font-extrabold font-display">{stats.totalUsers}</div>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Registered accounts</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-muted">Documents</span>
                  <FileText className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="text-2xl font-extrabold font-display">{stats.totalDocuments}</div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Persisted workspaces</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-muted">PDF Exports</span>
                  <Download className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="text-2xl font-extrabold font-display">{stats.totalPdfExports}</div>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Rendered & delivered</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-brand-border shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase text-brand-muted">Active Templates</span>
                  <LayoutTemplate className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="text-2xl font-extrabold font-display">{stats.totalTemplates}</div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">Configured design systems</p>
              </div>
            </div>

            {/* Recent Audit Events */}
            <div className="p-6 bg-white rounded-2xl border border-brand-border shadow-soft">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-brand-orange" />
                <h3 className="font-bold text-sm">Recent System Events</h3>
              </div>
              <div className="space-y-2">
                {stats.recentEvents?.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 text-xs border border-slate-100"
                  >
                    <span className="font-bold font-mono text-slate-700">{evt.eventType}</span>
                    <span className="text-slate-400">
                      {new Date(evt.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-brand-border shadow-soft overflow-hidden">
            <div className="p-5 border-b border-brand-border">
              <h3 className="font-bold text-sm">User Directory</h3>
              <p className="text-xs text-brand-muted">All registered creators and system administrators.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-brand-border text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created Docs</th>
                    <th className="p-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-brand-charcoal">{u.name}</td>
                      <td className="p-4 font-mono text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{u._count?.documents || 0}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Documents Audit Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl border border-brand-border shadow-soft overflow-hidden">
            <div className="p-5 border-b border-brand-border">
              <h3 className="font-bold text-sm">Document Registry</h3>
              <p className="text-xs text-brand-muted">Complete index of created documents across all accounts.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-brand-border text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">Title</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Template</th>
                    <th className="p-4">Exports</th>
                    <th className="p-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {docsList.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-brand-charcoal">{d.title}</td>
                      <td className="p-4 text-slate-600">{d.user?.name || d.user?.email || 'Anonymous'}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700">
                          {d.templateId}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">{d._count?.pdfExports || 0}</td>
                      <td className="p-4 text-slate-400">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
