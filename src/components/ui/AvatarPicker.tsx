'use client';

/**
 * AvatarPicker Component
 * 
 * Reusable avatar selection grid with Figma-level polish.
 * Used in onboarding and settings.
 * 
 * Features:
 * - Spring physics animations
 * - Focus ring for keyboard accessibility
 * - Hover/tap states
 * - Selection overlay with checkmark
 * - Proper ARIA labels
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { AvatarId, AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from '@/domain/user/avatars';

interface AvatarPickerProps {
    /** Currently selected avatar ID */
    value: AvatarId | null;
    /** Callback when avatar is selected */
    onChange: (id: AvatarId) => void;
    /** Grid columns (default: 6 for settings, 3 for onboarding) */
    columns?: 3 | 6;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Optional label */
    label?: string;
}

const sizeConfig = {
    sm: { imageSize: '48px', gap: 'gap-2', rounded: 'rounded-lg' },
    md: { imageSize: '60px', gap: 'gap-3', rounded: 'rounded-xl' },
    lg: { imageSize: '80px', gap: 'gap-4', rounded: 'rounded-2xl' },
};

export function AvatarPicker({
    value,
    onChange,
    columns = 6,
    size = 'md',
    label,
}: AvatarPickerProps) {
    const selectedId = value || DEFAULT_AVATAR_ID;
    const config = sizeConfig[size];

    return (
        <div>
            {label && (
                <label
                    className="text-xs font-medium block mb-3"
                    style={{ color: 'var(--text-subtle)' }}
                >
                    {label}
                </label>
            )}
            <div
                className={`grid ${config.gap}`}
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                role="radiogroup"
                aria-label="Select avatar"
            >
                {AVATAR_OPTIONS.map((avatar, index) => {
                    const isSelected = selectedId === avatar.id;

                    return (
                        <motion.button
                            key={avatar.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Select ${avatar.name} avatar`}
                            onClick={() => onChange(avatar.id)}
                            className={`relative aspect-square ${config.rounded} overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                            style={{
                                border: isSelected
                                    ? '2px solid var(--color-accent)'
                                    : '1px solid var(--border-base)',
                                // @ts-expect-error CSS custom property
                                '--tw-ring-color': 'var(--color-accent)',
                                '--tw-ring-offset-color': 'var(--bg-base)',
                            }}
                            initial={false}
                            animate={{
                                scale: isSelected ? 1.05 : 1,
                                boxShadow: isSelected
                                    ? '0 8px 24px color-mix(in srgb, var(--color-accent) 30%, transparent)'
                                    : '0 0 0 transparent',
                            }}
                            whileHover={{ scale: isSelected ? 1.05 : 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                            }}
                        >
                            <Image
                                src={avatar.path}
                                alt={avatar.name}
                                fill
                                className="object-cover"
                                sizes={config.imageSize}
                                priority={index < 3}
                            />

                            {/* Selection overlay with checkmark */}
                            {isSelected && (
                                <motion.div
                                    className="absolute inset-0 flex items-center justify-center"
                                    style={{ background: 'color-mix(in srgb, var(--color-accent) 40%, transparent)' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 20,
                                        }}
                                    >
                                        <Check
                                            size={size === 'lg' ? 24 : size === 'md' ? 20 : 16}
                                            strokeWidth={3}
                                            style={{ color: 'var(--bg-base)' }}
                                        />
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Keyboard shortcut badge (only for large/onboarding) */}
                            {size === 'lg' && (
                                <div
                                    className="absolute bottom-2 left-2 w-5 h-5 rounded font-mono flex items-center justify-center"
                                    style={{
                                        background: 'var(--bg-overlay)',
                                        color: 'var(--text-subtle)',
                                        fontSize: '10px',
                                    }}
                                    aria-hidden="true"
                                >
                                    {index + 1}
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
