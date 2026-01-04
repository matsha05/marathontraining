"use client";

import { ReactNode } from 'react';
import { PlanProvider } from '@/domain/plan/context';
import { AuthProvider } from '@/domain/auth/context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

/**
 * App Layout
 *
 * Wraps all authenticated app pages with:
 * - AuthProvider for shared user state
 * - PlanProvider for training plan context
 * - ErrorBoundary for graceful error handling
 * - OfflineIndicator for connection status
 */
export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <PlanProvider>
                    {children}
                    <OfflineIndicator />
                </PlanProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
