'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DocumentModel, DocumentSettings, DocumentPage, getTemplateById } from '@docucraft/shared';
import { apiClient } from '../lib/api-client';
import { useAuth } from './auth-context';
import { useUI } from './ui-context';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface DocumentContextType {
  document: DocumentModel | null;
  setDocument: React.Dispatch<React.SetStateAction<DocumentModel | null>>;
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  saveStatus: SaveStatus;
  updateTitle: (title: string) => void;
  updatePageContent: (pageIndex: number, contentHtml: string) => void;
  updateSettings: (newSettings: Partial<DocumentSettings>) => void;
  switchTemplate: (templateId: string) => void;
  addPage: () => void;
  duplicatePage: (index: number) => void;
  deletePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  saveNow: (forceVersion?: boolean) => Promise<void>;
  downloadPdf: () => Promise<void>;
  isGeneratingPdf: boolean;
}

const DocumentContext = createContext<DocumentContextType | null>(null);

export function DocumentProvider({
  initialDocument,
  children,
}: {
  initialDocument: DocumentModel;
  children: React.ReactNode;
}) {
  const [doc, setDoc] = useState<DocumentModel>(initialDocument);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const { user } = useAuth();
  const { openAuthModal, addToast } = useUI();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Sync draft to localStorage in case user is not authenticated or tab closes
  useEffect(() => {
    if (doc) {
      try {
        localStorage.setItem(`docucraft_draft_${doc.id}`, JSON.stringify(doc));
      } catch {}
    }
  }, [doc]);

  const saveNow = useCallback(async (forceVersion = false) => {
    if (!doc) return;
    if (!user) {
      // User is not logged in: draft is safely preserved in localStorage
      setSaveStatus('saved');
      return;
    }

    try {
      setSaveStatus('saving');
      const updated = await apiClient.put<DocumentModel>(
        `/documents/${doc.id}?version=${forceVersion ? 'true' : 'false'}`,
        {
          title: doc.title,
          templateId: doc.templateId,
          settings: doc.settings,
          pages: doc.pages,
        }
      );
      setDoc((prev) => ({
        ...prev,
        version: updated.version,
        updatedAt: updated.updatedAt,
      }));
      setSaveStatus('saved');
      isDirtyRef.current = false;
    } catch (err: any) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    }
  }, [doc, user]);

  // Debounced autosave
  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
    setSaveStatus('unsaved');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      saveNow(false);
    }, 1500);
  }, [saveNow]);

  const updateTitle = useCallback((title: string) => {
    setDoc((prev) => ({ ...prev, title }));
    markDirty();
  }, [markDirty]);

  const updatePageContent = useCallback((pageIndex: number, contentHtml: string) => {
    setDoc((prev) => {
      const updatedPages = [...prev.pages];
      if (updatedPages[pageIndex]) {
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          contentHtml,
        };
      }
      return { ...prev, pages: updatedPages };
    });
    markDirty();
  }, [markDirty]);

  const updateSettings = useCallback((newSettings: Partial<DocumentSettings>) => {
    setDoc((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
    markDirty();
  }, [markDirty]);

  const switchTemplate = useCallback((templateId: string) => {
    const template = getTemplateById(templateId);
    setDoc((prev) => ({
      ...prev,
      templateId,
      settings: {
        ...template.defaultSettings,
        // preserve existing header logo if already set
        header: {
          ...template.defaultSettings.header,
          logoUrl: prev.settings.header.logoUrl || template.defaultSettings.header.logoUrl,
        },
      },
    }));
    addToast(`Template switched to "${template.name}"`, 'info');
    markDirty();
  }, [addToast, markDirty]);

  const addPage = useCallback(() => {
    setDoc((prev) => {
      const newPageNumber = prev.pages.length + 1;
      const newPage: DocumentPage = {
        id: `page-${Date.now()}`,
        pageNumber: newPageNumber,
        contentHtml: `<p>Start writing on page ${newPageNumber}...</p>`,
      };
      return {
        ...prev,
        pages: [...prev.pages, newPage],
      };
    });
    setActivePageIndex(doc.pages.length);
    addToast('Page added', 'info');
    markDirty();
  }, [doc.pages.length, addToast, markDirty]);

  const duplicatePage = useCallback((index: number) => {
    setDoc((prev) => {
      const target = prev.pages[index];
      if (!target) return prev;
      const duplicated: DocumentPage = {
        id: `page-${Date.now()}`,
        pageNumber: index + 2,
        contentHtml: target.contentHtml,
      };
      const updatedPages = [...prev.pages];
      updatedPages.splice(index + 1, 0, duplicated);
      // Re-index page numbers
      return {
        ...prev,
        pages: updatedPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
      };
    });
    setActivePageIndex(index + 1);
    addToast('Page duplicated', 'info');
    markDirty();
  }, [addToast, markDirty]);

  const deletePage = useCallback((index: number) => {
    if (doc.pages.length <= 1) {
      addToast('Document must contain at least one page.', 'error');
      return;
    }
    setDoc((prev) => {
      const filtered = prev.pages.filter((_, idx) => idx !== index);
      return {
        ...prev,
        pages: filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
      };
    });
    setActivePageIndex((prev) => Math.max(0, prev - 1));
    addToast('Page deleted', 'info');
    markDirty();
  }, [doc.pages.length, addToast, markDirty]);

  const reorderPages = useCallback((fromIndex: number, toIndex: number) => {
    setDoc((prev) => {
      const pages = [...prev.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      return {
        ...prev,
        pages: pages.map((p, idx) => ({ ...p, pageNumber: idx + 1 })),
      };
    });
    setActivePageIndex(toIndex);
    markDirty();
  }, [markDirty]);

  // Protected PDF Download Execution with Generation Lock
  const executeDownload = useCallback(async () => {
    if (!doc || isGeneratingPdf) return;
    try {
      setIsGeneratingPdf(true);
      addToast('Preparing your document...', 'info');

      // First ensure the latest state is persisted on backend
      await saveNow(false);

      addToast('Generating high-performance PDF...', 'info');

      // Call protected download endpoint
      const blob = await apiClient.downloadPdf(doc.id, doc);

      addToast('Downloading PDF file...', 'info');

      // Trigger browser download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const safeTitle = (doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      addToast('Download complete!', 'success');
    } catch (err: any) {
      console.error('PDF download error:', err);
      if (err.status === 401) {
        openAuthModal(() => executeDownload());
      } else {
        addToast(err.message || 'Failed to generate PDF. Please try again.', 'error');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [doc, isGeneratingPdf, saveNow, addToast, openAuthModal]);

  // Intercept download: checks authentication first!
  const downloadPdf = useCallback(async () => {
    if (!user) {
      // Strict rule: unauthenticated user clicking download triggers auth modal
      openAuthModal(() => {
        executeDownload();
      });
      return;
    }
    await executeDownload();
  }, [user, openAuthModal, executeDownload]);

  return (
    <DocumentContext.Provider
      value={{
        document: doc,
        setDocument: setDoc as any,
        activePageIndex,
        setActivePageIndex,
        saveStatus,
        updateTitle,
        updatePageContent,
        updateSettings,
        switchTemplate,
        addPage,
        duplicatePage,
        deletePage,
        reorderPages,
        saveNow,
        downloadPdf,
        isGeneratingPdf,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}
