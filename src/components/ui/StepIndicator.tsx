"use client";

/**
 * StepIndicator - Segmented progress for multi-step flows
 * 
 * V3 Design System
 * Uses centralized tokens from design-tokens.ts
 */

import { cn } from "@/lib/utils";
import { stepIndicatorTokens, type StepIndicatorSize } from "@/lib/design-tokens";

export interface StepIndicatorProps {
    /** Total number of steps */
    totalSteps: number;
    /** Current step (1-indexed) */
    currentStep: number;
    /** Size variant */
    size?: StepIndicatorSize;
    /** Show step counter above bar */
    showNumbers?: boolean;
    /** Additional className */
    className?: string;
}

export function StepIndicator({
    totalSteps,
    currentStep,
    size = "md",
    showNumbers = false,
    className,
}: StepIndicatorProps) {
    const sizeConfig = stepIndicatorTokens.sizes[size];
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
    const clampedCurrent = Math.min(totalSteps, Math.max(1, currentStep));

    return (
        <div className={cn("w-full", className)}>
            {/* Step counter */}
            {showNumbers && (
                <div className="flex items-center gap-1 mb-2">
                    <span
                        className={cn(sizeConfig.numberSize, "font-semibold")}
                        style={{ color: stepIndicatorTokens.active }}
                    >
                        Step {clampedCurrent}
                    </span>
                    <span
                        className={sizeConfig.numberSize}
                        style={{ color: "var(--text-subtle)" }}
                    >
                        / {totalSteps}
                    </span>
                </div>
            )}

            {/* Segmented bar */}
            <div className={cn("flex", sizeConfig.gap)}>
                {steps.map((step) => {
                    const isCompleted = step < clampedCurrent;
                    const isCurrent = step === clampedCurrent;
                    const isActive = isCompleted || isCurrent;

                    return (
                        <div
                            key={step}
                            className={cn(
                                "flex-1 rounded-full transition-all duration-300",
                                sizeConfig.height
                            )}
                            style={{
                                backgroundColor: isActive
                                    ? stepIndicatorTokens.active
                                    : stepIndicatorTokens.inactive,
                                opacity: isCompleted ? stepIndicatorTokens.completedOpacity : 1,
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default StepIndicator;
