'use client';

/**
 * AvatarDisplay Component
 * 
 * Displays user avatar with graceful fallback to initials.
 * Use this everywhere an avatar needs to be shown.
 * 
 * Features:
 * - Shows avatar image if set
 * - Falls back to initials in gradient circle
 * - Configurable sizes
 * - Optional click handler for editing
 */

import Image from 'next/image';
import { getAvatarPath, AvatarId } from '@/domain/user/avatars';

interface AvatarDisplayProps {
    /** Avatar ID (null shows initials fallback) */
    avatarId: AvatarId | string | null | undefined;
    /** User's name for initials fallback */
    name: string;
    /** Size in pixels */
    size?: 24 | 32 | 40 | 48 | 64 | 80 | 96;
    /** Optional click handler */
    onClick?: () => void;
    /** Additional class names */
    className?: string;
}

/**
 * Extract initials from a name (max 2 characters)
 */
function getInitials(name: string): string {
    if (!name?.trim()) return 'TL';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const fontSizeMap: Record<number, string> = {
    24: 'text-[10px]',
    32: 'text-xs',
    40: 'text-sm',
    48: 'text-base',
    64: 'text-xl',
    80: 'text-2xl',
    96: 'text-3xl',
};

export function AvatarDisplay({
    avatarId,
    name,
    size = 48,
    onClick,
    className = '',
}: AvatarDisplayProps) {
    const hasAvatar = !!avatarId;
    const initials = getInitials(name);
    const fontSize = fontSizeMap[size] || 'text-base';

    const containerClasses = `
        relative rounded-full overflow-hidden flex-shrink-0
        ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}
        ${className}
    `.trim();

    const content = hasAvatar ? (
        <Image
            src={getAvatarPath(avatarId)}
            alt={`${name}'s avatar`}
            fill
            className="object-cover"
            sizes={`${size}px`}
        />
    ) : (
        <div
            className={`w-full h-full flex items-center justify-center font-semibold ${fontSize}`}
            style={{
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-strength))',
                color: 'var(--bg-base)',
            }}
        >
            {initials}
        </div>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={containerClasses}
                style={{ width: size, height: size }}
                aria-label={`${name}'s profile picture. Click to edit.`}
            >
                {content}
            </button>
        );
    }

    return (
        <div
            className={containerClasses}
            style={{ width: size, height: size }}
            role="img"
            aria-label={`${name}'s profile picture`}
        >
            {content}
        </div>
    );
}
