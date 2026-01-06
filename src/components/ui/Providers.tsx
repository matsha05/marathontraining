/**
 * THE LONG GAME - Client-side Providers
 * 
 * Bundles all client-side context providers for the app.
 */

'use client';

import { ToastProvider } from './Toast';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}
