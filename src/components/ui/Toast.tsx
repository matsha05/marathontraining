/**
 * THE LONG GAME - Toast Notification System
 * 
 * Simple, elegant toast notifications following V2 design system.
 * Zero dependencies beyond React.
 */

'use client';

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// =============================================================================
// PROVIDER
// =============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        setToasts(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, duration?: number) => addToast('success', message, duration), [addToast]);
    const error = useCallback((message: string, duration?: number) => addToast('error', message, duration), [addToast]);
    const info = useCallback((message: string, duration?: number) => addToast('info', message, duration), [addToast]);
    const warning = useCallback((message: string, duration?: number) => addToast('warning', message, duration), [addToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </ToastContext.Provider>
    );
}

// =============================================================================
// TOAST CONTAINER
// =============================================================================

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {
        bg: 'rgba(39, 174, 96, 0.1)',
        border: 'var(--v2-accent)',
        icon: '✓',
    },
    error: {
        bg: 'rgba(231, 76, 60, 0.1)',
        border: 'var(--v2-error)',
        icon: '✕',
    },
    info: {
        bg: 'rgba(52, 152, 219, 0.1)',
        border: 'var(--v2-secondary)',
        icon: 'ℹ',
    },
    warning: {
        bg: 'rgba(241, 196, 15, 0.1)',
        border: '#f1c40f',
        icon: '⚠',
    },
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const colors = TOAST_COLORS[toast.type];
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
    }, [onDismiss, toast.id]);

    return (
        <div
            role="alert"
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg 
                min-w-[280px] max-w-[400px]
                border-l-4 shadow-lg
                transition-all duration-200
                ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
            `}
            style={{
                background: colors.bg,
                borderLeftColor: colors.border,
                backdropFilter: 'blur(8px)',
            }}
        >
            {/* Icon */}
            <span
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                    background: colors.border,
                    color: '#04110b',
                }}
            >
                {colors.icon}
            </span>

            {/* Message */}
            <p className="flex-1 text-sm" style={{ color: 'var(--v2-text-secondary)' }}>
                {toast.message}
            </p>

            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                style={{ color: 'var(--v2-text-muted)' }}
                aria-label="Dismiss"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

// =============================================================================
// EXPORTS
// =============================================================================

export { ToastContext };
export type { Toast, ToastType, ToastContextValue };
