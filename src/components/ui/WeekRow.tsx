import { forwardRef, type HTMLAttributes } from 'react';
import { MobileScroller, type ScrollHint } from '@/components/ui/MobileScroller';
import { cn } from '@/lib/utils';

type WeekRowVariant = 'landing' | 'app' | 'compact';

const variantClasses: Record<WeekRowVariant, string> = {
    landing: 'gap-2 py-2 md:grid md:grid-cols-7 md:gap-2',
    app: 'gap-2 pb-2 md:grid md:grid-cols-7 md:gap-2',
    compact: 'gap-1 pb-2 md:grid md:grid-cols-7 md:gap-1',
};

interface WeekRowProps extends HTMLAttributes<HTMLDivElement> {
    variant?: WeekRowVariant;
    hint?: ScrollHint;
}

export const WeekRow = forwardRef<HTMLDivElement, WeekRowProps>(
    ({ variant = 'app', hint, className, ...props }, ref) => (
        <MobileScroller
            ref={ref}
            hint={hint}
            className={cn(variantClasses[variant], className)}
            {...props}
        />
    )
);

WeekRow.displayName = 'WeekRow';
