import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
    label: string;
    showTooltip?: boolean;
    showMobileLabel?: boolean;
    mobileLabelClassName?: string;
}

export function Tooltip({
    label,
    showTooltip = true,
    showMobileLabel = false,
    mobileLabelClassName,
    className,
    children,
    ...props
}: TooltipProps) {
    return (
        <span
            className={cn('tooltip-trigger', className)}
            data-tooltip={showTooltip ? label : undefined}
            aria-label={label}
            {...props}
        >
            {children}
            {showMobileLabel && (
                <span className={cn('ml-1 text-[10px] md:hidden', mobileLabelClassName)}>
                    {label}
                </span>
            )}
        </span>
    );
}
