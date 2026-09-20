'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UIContextType {
  authModalOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  onAuthSuccess: () => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openAuthModal = useCallback((onSuccess?: () => void) => {
    if (onSuccess) {
      setPendingAction(() => onSuccess);
    }
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setPendingAction(null);
  }, []);

  const onAuthSuccess = useCallback(() => {
    setAuthModalOpen(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      // Execute the pending action (such as resuming download) after modal closes
      setTimeout(() => {
        action();
      }, 150);
    }
  }, [pendingAction]);

  return (
    <UIContext.Provider
      value={{
        authModalOpen,
        openAuthModal,
        closeAuthModal,
        onAuthSuccess,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
