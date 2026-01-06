/**
 * THE LONG GAME - Modal Component
 * 
 * Accessible modal/dialog following V2 design system.
 * Supports keyboard navigation and focus trapping.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// =============================================================================
// TYPES
// =============================================================================

interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Called when modal should close */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal content */
    children: React.ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Whether clicking backdrop closes modal */
    closeOnBackdrop?: boolean;
    /** Whether ESC key closes modal */
    closeOnEsc?: boolean;
    /** Custom class for modal content */
    className?: string;
}

// =============================================================================
// SIZE CONFIG
// =============================================================================

const SIZE_CLASSES: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
};

// =============================================================================
// MODAL COMPONENT
// =============================================================================

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEsc = true,
    className = '',
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Focus trap and keyboard handling
    useEffect(() => {
        if (!isOpen) return;

        // Save currently focused element
        previousActiveElement.current = document.activeElement;

        // Focus the modal
        modalRef.current?.focus();

        // Handle ESC key
        const handleKeyDown = (e: KeyboardEvent) => {
            if (closeOnEsc && e.key === 'Escape') {
                onClose();
            }

            // Focus trap
            if (e.key === 'Tab' && modalRef.current) {
                const focusableElements = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement?.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement?.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';

            // Restore focus
            if (previousActiveElement.current instanceof HTMLElement) {
                previousActiveElement.current.focus();
            }
        };
    }, [isOpen, closeOnEsc, onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    }, [closeOnBackdrop, onClose]);

    if (!isOpen) return null;

    // Use portal for proper stacking
    return createPortal(
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                aria-hidden="true"
            />

            {/* Modal content */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className={`
                    relative w-full ${SIZE_CLASSES[size]} 
                    rounded-xl shadow-2xl
                    transform transition-all duration-200
                    ${className}
                `}
                style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-base)',
                }}
            >
                {/* Header */}
                {title && (
                    <div
                        className="flex items-center justify-between px-6 py-4"
                        style={{ borderBottom: '1px solid var(--border-base)' }}
                    >
                        <h2
                            id="modal-title"
                            className="text-xl font-light"
                            style={{ color: 'var(--text-base)' }}
                        >
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            aria-label="Close modal"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}

// =============================================================================
// CONFIRM MODAL
// =============================================================================

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
}: ConfirmModalProps) {
    const confirmColors = {
        danger: 'var(--v3-error)',
        warning: '#f1c40f',
        default: 'var(--color-accent)',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                {message}
            </p>

            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="v3-btn v3-btn-secondary"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className="v3-btn"
                    style={{
                        background: confirmColors[variant],
                        color: '#04110b',
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { ModalProps, ConfirmModalProps };
