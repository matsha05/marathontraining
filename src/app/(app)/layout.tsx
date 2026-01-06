"use client";

import { ReactNode } from 'react';
import { PlanProvider } from '@/domain/plan/context';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';
import { SiteFooter } from '@/components/ui/SiteFooter';

/**
 * App Layout
 *
 * Wraps all authenticated app pages with:
 * - PlanProvider for training plan context (uses AuthProvider from root)
 * - ErrorBoundary for graceful error handling
 * - OfflineIndicator for connection status
 * - SiteFooter for consistent site-wide footer
 * 
 * Note: AuthProvider is now at root level (Providers.tsx) so all pages share it.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
    return (
        <ErrorBoundary>
            <PlanProvider>
                <div className="flex flex-col min-h-screen">
                    <div className="flex-1">
                        {children}
                    </div>
                    <SiteFooter />
                </div>
                <OfflineIndicator />
            </PlanProvider>
        </ErrorBoundary>
    );
}

