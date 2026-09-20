'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocumentModel, TEMPLATES } from '@docucraft/shared';
import { apiClient } from '../../lib/api-client';
import { useAuth } from '../../stores/auth-context';
import { useUI } from '../../stores/ui-context';
import { DocuCraftLogo } from '../../components/brand/DocuCraftLogo';
import { DocumentPreview } from '../../components/preview/DocumentPreview';
import {
  Plus,
  Search,
  Star,
  Trash2,
  Copy,
  Download,
  Edit,
  RotateCcw,
  Clock,
  LogOut,
  FolderOpen,
  Loader2,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  const { addToast } = useUI();

  const [documents, setDocuments] = useState<DocumentModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const isFavorite = activeTab === 'favorites' ? true : undefined;
      const isTrash = activeTab === 'trash';
      const search = searchQuery.trim() || undefined;

      const params = new URLSearchParams();
      if (isFavorite !== undefined) params.append('isFavorite', 'true');
      if (isTrash) params.append('isTrash', 'true');
      if (search) params.append('search', search);

      const res = await apiClient.get<{ documents: DocumentModel[]; total: number }>(
        `/documents?${params.toString()}`
      );
      setDocuments(res.documents);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDocuments();
    }
  }, [user, authLoading, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocuments();
  };

  const handleDuplicate = async (docId: string) => {
    try {
      const duplicated = await apiClient.post<DocumentModel>(`/documents/${docId}/duplicate`);
      addToast('Document duplicated successfully!', 'success');
      fetchDocuments();
    } catch (err: any) {
      addToast(err.message || 'Failed to duplicate document', 'error');
    }
  };

  const handleToggleFavorite = async (doc: DocumentModel) => {
    try {
      await apiClient.post(`/documents/${doc.id}/favorite`, { isFavorite: !doc.isFavorite });
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, isFavorite: !d.isFavorite } : d))
      );
      addToast(doc.isFavorite ? 'Removed from favorites' : 'Marked as favorite', 'info');
    } catch (err: any) {
      addToast('Failed to update favorite status', 'error');
    }
  };

  const handleTrash = async (docId: string) => {
    try {
      await apiClient.post(`/documents/${docId}/trash`);
      addToast('Moved to trash', 'info');
      fetchDocuments();
    } catch (err: any) {
      addToast('Failed to move to trash', 'error');
    }
  };

  const handleRestore = async (docId: string) => {
    try {
      await apiClient.post(`/documents/${docId}/restore`);
      addToast('Document restored', 'success');
      fetchDocuments();
    } catch (err: any) {
      addToast('Failed to restore document', 'error');
    }
  };

  const handleDeletePermanent = async (docId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this document? This cannot be undone.')) {
      return;
    }
    try {
      await apiClient.delete(`/documents/${docId}`);
      addToast('Document permanently deleted', 'info');
      fetchDocuments();
    } catch (err: any) {
      addToast('Failed to delete document', 'error');
    }
  };

  const handleDownload = async (doc: DocumentModel) => {
    try {
      setDownloadingId(doc.id);
      addToast('Generating vector PDF...', 'info');

      const blob = await apiClient.downloadPdf(doc.id, doc);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeTitle = (doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      addToast('PDF downloaded successfully!', 'success');
    } catch (err: any) {
      addToast('Failed to generate PDF. Please try again.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-paper-sand text-ink-900 flex flex-col font-sans">
      {/* Dashboard Top Header */}
      <header className="h-16 bg-white border-b border-paper-border px-6 flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="hover:opacity-90 transition-opacity">
          <DocuCraftLogo size="sm" />
        </Link>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs text-ink-500">
            <span>{user?.name || user?.email}</span>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="px-2 py-0.5 rounded bg-ink-900 text-white font-mono text-[10px]"
              >
                ADMIN
              </Link>
            )}
          </div>

          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs transition-all shadow-subtle"
          >
            <Plus size={14} className="text-brand-orange" />
            <span>New Document</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-md text-ink-400 hover:text-ink-900 hover:bg-paper-card transition-colors"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Desk */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-paper-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink-900">
              {greeting}, {user?.name?.split(' ')[0] || 'Author'}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              Manage your document publications, drafts, and PDF exports.
            </p>
          </div>

          {/* Quick Template Launch Pill */}
          <Link
            href="/templates"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-ink-700 bg-white border border-paper-border hover:bg-paper-card rounded-md shadow-subtle transition-all"
          >
            <Layers size={13} className="text-brand-orange" />
            <span>Template Catalog</span>
            <ArrowRight size={12} className="text-ink-400" />
          </Link>
        </div>

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 bg-white border border-paper-border rounded-md shadow-subtle">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all ${
                activeTab === 'all'
                  ? 'bg-ink-900 text-white shadow-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              All Documents
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('favorites')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all ${
                activeTab === 'favorites'
                  ? 'bg-ink-900 text-white shadow-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Favorites
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trash')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-all ${
                activeTab === 'trash'
                  ? 'bg-ink-900 text-white shadow-subtle'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              Trash
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-md border border-paper-border bg-white text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-orange shadow-subtle transition-all"
            />
          </form>
        </div>

        {/* Documents Grid / Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-ink-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-orange mb-2" />
            <span className="text-xs">Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white border border-paper-border rounded-lg p-12 text-center max-w-md mx-auto my-12 shadow-paper">
            <div className="w-12 h-12 rounded bg-paper-sand border border-paper-border flex items-center justify-center text-brand-orange mx-auto mb-3">
              <FolderOpen size={20} />
            </div>
            <h3 className="text-sm font-bold text-ink-900 mb-1">
              {activeTab === 'trash'
                ? 'Trash is empty'
                : activeTab === 'favorites'
                ? 'No favorite documents yet'
                : 'No documents found'}
            </h3>
            <p className="text-xs text-ink-500 mb-5 leading-relaxed">
              {activeTab === 'trash'
                ? 'Deleted documents will appear here for recovery.'
                : 'Create your first document and publish clean vector PDFs.'}
            </p>
            {activeTab !== 'trash' && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-ink-900 hover:bg-ink-800 text-white font-semibold text-xs shadow-paper transition-all"
              >
                <Plus size={13} className="text-brand-orange" />
                <span>Create Document</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => {
              const dateFormatted = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={doc.id}
                  className="group bg-white rounded-lg border border-paper-border hover:border-brand-orange/50 p-5 shadow-paper hover:shadow-paper-lg transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Template Tag & Favorite */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 bg-paper-sand border border-paper-border px-2 py-0.5 rounded">
                        {doc.templateId}
                      </span>
                      {activeTab !== 'trash' && (
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(doc)}
                          className="p-1 text-ink-300 hover:text-amber-500 transition-colors"
                          title={doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                        >
                          <Star
                            size={14}
                            className={doc.isFavorite ? 'fill-amber-400 text-amber-500' : ''}
                          />
                        </button>
                      )}
                    </div>

                    <Link href={`/editor/${doc.id}`} className="block">
                      <h3 className="text-sm font-bold text-ink-900 group-hover:text-brand-orange transition-colors line-clamp-1 mb-1">
                        {doc.title || 'Untitled Document'}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-ink-400 mb-3">
                        <Clock size={11} />
                        <span>Edited {dateFormatted}</span>
                        <span>•</span>
                        <span>{doc.pages.length} {doc.pages.length === 1 ? 'page' : 'pages'}</span>
                      </div>
                    </Link>

                    {/* Actual Document Sheet Thumbnail */}
                    <Link
                      href={`/editor/${doc.id}`}
                      className="block p-3 bg-paper-card border border-paper-border rounded overflow-hidden group-hover:border-brand-orange/30 transition-colors"
                    >
                      <div className="w-full max-w-[200px] mx-auto pointer-events-none">
                        <DocumentPreview document={doc} mode="thumbnail" shadow={false} hoverLift={false} />
                      </div>
                    </Link>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 pt-3 border-t border-paper-border flex items-center justify-between">
                    {activeTab === 'trash' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(doc.id)}
                          className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePermanent(doc.id)}
                          className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 text-ink-500">
                          <Link
                            href={`/editor/${doc.id}`}
                            className="p-1.5 rounded hover:bg-paper-card hover:text-ink-900 transition-colors"
                            title="Edit Document"
                          >
                            <Edit size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(doc.id)}
                            className="p-1.5 rounded hover:bg-paper-card hover:text-ink-900 transition-colors"
                            title="Duplicate"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTrash(doc.id)}
                            className="p-1.5 rounded hover:bg-red-50 hover:text-red-600 text-ink-400 transition-colors"
                            title="Move to Trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          disabled={downloadingId === doc.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-paper-sand hover:bg-white border border-paper-border text-xs font-semibold text-ink-900 shadow-subtle transition-all disabled:opacity-50"
                        >
                          {downloadingId === doc.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Download size={12} className="text-brand-orange" />
                          )}
                          <span>PDF</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
