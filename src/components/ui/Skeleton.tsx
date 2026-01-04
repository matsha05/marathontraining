"use client";

/**
 * Skeleton Components
 *
 * Loading placeholder components for smooth UX during data fetching.
 * These provide visual feedback while content loads.
 */

interface SkeletonProps {
    className?: string;
}

/**
 * Base skeleton with pulse animation
 */
export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-[var(--bg-elevated)] rounded ${className}`}
        />
    );
}

/**
 * Text line skeleton
 */
export function SkeletonText({ className = "" }: SkeletonProps) {
    return <Skeleton className={`h-4 ${className}`} />;
}

/**
 * Heading skeleton
 */
export function SkeletonHeading({ className = "" }: SkeletonProps) {
    return <Skeleton className={`h-8 ${className}`} />;
}

/**
 * Card skeleton
 */
export function SkeletonCard({ className = "" }: SkeletonProps) {
    return (
        <div className={`card p-6 ${className}`}>
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    );
}

/**
 * Dashboard skeleton - full page loading state
 */
export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header skeleton */}
            <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Greeting */}
                <div>
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>

                {/* Today's workout card */}
                <div className="card p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <Skeleton className="h-5 w-24 mb-2" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <Skeleton className="h-16 w-16 rounded-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full rounded-lg" />
                        <Skeleton className="h-16 w-full rounded-lg" />
                    </div>
                </div>

                {/* Week overview */}
                <div className="card p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="text-center">
                                <Skeleton className="h-4 w-8 mx-auto mb-2" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Plan page skeleton
 */
export function PlanSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div>
                    <Skeleton className="h-10 w-64 mb-2" />
                    <Skeleton className="h-5 w-96" />
                </div>

                {/* Phase pills */}
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>

                {/* Week cards */}
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {[...Array(7)].map((_, j) => (
                                    <Skeleton key={j} className="h-20 rounded-lg" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * Workout detail skeleton
 */
export function WorkoutSkeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                {/* Header */}
                <div>
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <div className="flex gap-4">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                </div>

                {/* Sections */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="card p-6">
                        <Skeleton className="h-6 w-32 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    </div>
                ))}

                {/* Action button */}
                <Skeleton className="h-14 w-full rounded-xl" />
            </div>
        </div>
    );
}

export default Skeleton;
