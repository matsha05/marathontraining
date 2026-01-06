"use client";

import { ReactNode } from 'react';
import { PlanProvider } from '@/domain/plan/context';
import { AuthProvider } from '@/domain/auth/context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { SiteFooter } from '@/components/ui/SiteFooter';

/**
 * App Layout
 *
 * Wraps all authenticated app pages with:
 * - AuthProvider for shared user state
 * - PlanProvider for training plan context
 * - ErrorBoundary for graceful error handling
 * - OfflineIndicator for connection status
 * - SiteFooter for consistent site-wide footer
 */
export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <PlanProvider>
                    <div className="flex flex-col min-h-screen">
                        <div className="flex-1">
                            {children}
                        </div>
                        <SiteFooter />
                    </div>
                    <OfflineIndicator />
                </PlanProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
