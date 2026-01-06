"use client";

import { Component, ReactNode } from 'react';

/**
 * Error Boundary Component
 *
 * V2 Design System - Catches errors and displays graceful fallback
 */

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div
                            className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--bg-elevated)' }}
                        >
                            <svg
                                className="w-8 h-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-light mb-2" style={{ color: 'var(--text-base)' }}>Something went wrong</h2>
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="v3-btn v3-btn-secondary"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                <summary className="cursor-pointer">Error details</summary>
                                <pre
                                    className="mt-2 p-4 rounded-lg overflow-auto text-xs"
                                    style={{ background: 'var(--bg-elevated)' }}
                                >
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
