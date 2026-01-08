/**
 * THE LONG GAME - Client-side Providers
 * 
 * Bundles all client-side context providers for the app.
 * AuthProvider is at the root so ALL pages can use useAuth().
 */

'use client';

import { ToastProvider } from './Toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AuthProvider } from '@/domain/auth/context';
import { PullToRefresh } from './PullToRefresh';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <ToastProvider>
                    {children}
                    <PullToRefresh />
                </ToastProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
