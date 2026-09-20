'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentModel, getTemplateById } from '@docucraft/shared';
import { apiClient } from '../../../lib/api-client';
import { DocumentProvider } from '../../../stores/document-context';
import { EditorHeader } from '../../../components/editor/EditorHeader';
import { EditorSidebar } from '../../../components/editor/EditorSidebar';
import { EditorCanvas } from '../../../components/editor/EditorCanvas';
import { PreviewModal } from '../../../components/preview/PreviewModal';
import { DocumentPreviewRenderer } from '../../../components/preview/DocumentPreviewRenderer';
import { Loader2, AlertCircle } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.documentId as string;

  const [documentData, setDocumentData] = useState<DocumentModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        // 1. Try to fetch from backend
        try {
          const fetched = await apiClient.get<DocumentModel>(`/documents/${documentId}`);
          if (fetched) {
            setDocumentData(fetched);
            setLoading(false);
            return;
          }
        } catch {
          // Backend fetch may fail if user is anonymous or document is a local draft
        }

        // 2. Check local storage draft
        const draftStr = localStorage.getItem(`docucraft_draft_${documentId}`);
        if (draftStr) {
          const draft = JSON.parse(draftStr) as DocumentModel;
          setDocumentData(draft);
          setLoading(false);
          return;
        }

        // 3. Fallback: Initialize with default Professional Business template
        const defaultTmpl = getTemplateById('professional-business');
        const fallbackDoc: DocumentModel = {
          id: documentId,
          userId: 'anonymous',
          title: 'Strategic Corporate Overview',
          templateId: defaultTmpl.id,
          settings: defaultTmpl.defaultSettings,
          pages: [
            {
              id: 'page-1',
              pageNumber: 1,
              contentHtml: defaultTmpl.sampleContent.pages[0].contentHtml,
            },
          ],
          version: 1,
          isFavorite: false,
          isTrash: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setDocumentData(fallbackDoc);
      } catch (err: any) {
        setError(err.message || 'Failed to load document.');
      } finally {
        setLoading(false);
      }
    }

    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-brand-surface">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange mb-3" />
        <p className="text-sm font-semibold text-brand-charcoal">Loading your document workspace...</p>
      </div>
    );
  }

  if (error || !documentData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-brand-surface p-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-brand-charcoal mb-1">Unable to open document</h2>
        <p className="text-sm text-brand-muted mb-4">{error || 'Document could not be located.'}</p>
        <button
          type="button"
          onClick={() => router.push('/create')}
          className="px-4 py-2 rounded-xl bg-brand-orange text-white text-xs font-bold shadow"
        >
          Create New Document
        </button>
      </div>
    );
  }

  return (
    <DocumentProvider initialDocument={documentData}>
      <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100">
        {/* Top Header */}
        <EditorHeader onTogglePreview={() => setShowPreviewModal(true)} />

        {/* Mobile View Toggle [ Edit ] [ Preview ] */}
        <div className="flex md:hidden bg-white border-b border-brand-border p-1">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${
              mobileTab === 'edit' ? 'bg-brand-cream text-brand-charcoal' : 'text-slate-500'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg ${
              mobileTab === 'preview' ? 'bg-brand-cream text-brand-charcoal' : 'text-slate-500'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Main 3-Column Desktop / Responsive Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (Desktop) */}
          <div className="hidden md:block">
            <EditorSidebar />
          </div>

          {/* Center Canvas */}
          <div className={`flex-1 flex overflow-hidden ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
            <EditorCanvas />
          </div>

          {/* Mobile Preview Tab Content */}
          {mobileTab === 'preview' && (
            <div className="flex-1 overflow-auto p-4 flex justify-center md:hidden bg-slate-100">
              <DocumentPreviewRenderer document={documentData} scale={0.7} />
            </div>
          )}
        </div>

        {/* Live Preview Fullscreen Modal */}
        <PreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      </div>
    </DocumentProvider>
  );
}
