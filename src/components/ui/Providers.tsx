/**
 * THE LONG GAME - Client-side Providers
 * 
 * Bundles all client-side context providers for the app.
 */

'use client';

import { ToastProvider } from './Toast';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </ThemeProvider>
    );
}
