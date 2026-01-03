"use client";

/**
 * Auth Layout - Centered, minimal
 */

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen landing-shell flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="card shadow-lg p-8 md:p-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
