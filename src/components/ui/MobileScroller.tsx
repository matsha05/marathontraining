import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ScrollHint = 'right' | 'left' | 'both' | 'none';

const hintClasses: Record<ScrollHint, string> = {
    right: 'scroll-hint-right',
    left: 'scroll-hint-left',
    both: 'scroll-hint-left scroll-hint-right',
    none: '',
};

interface MobileScrollerProps extends HTMLAttributes<HTMLDivElement> {
    hint?: ScrollHint;
}

export const MobileScroller = forwardRef<HTMLDivElement, MobileScrollerProps>(
    ({ hint = 'right', className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'mobile-scroll-x -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible',
                hintClasses[hint],
                className
            )}
            {...props}
        />
    )
);

MobileScroller.displayName = 'MobileScroller';
