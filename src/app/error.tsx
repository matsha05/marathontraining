'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="v3-root min-h-screen flex items-center justify-center px-6 py-12">
            <div className="v3-card p-8 text-center max-w-md w-full">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'var(--color-accent-subtle)' }}
                >
                    <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="v3-heading-md mb-3">Something went wrong.</h2>
                <p className="v3-body mb-8" style={{ color: 'var(--text-muted)' }}>
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <button
                    onClick={() => reset()}
                    className="v3-btn v3-btn-primary v3-btn-lg w-full"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
