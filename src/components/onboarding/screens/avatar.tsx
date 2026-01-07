'use client';

/**
 * Avatar Selection Screen
 * 
 * Allows users to pick their profile avatar during onboarding.
 * Uses the preset avatars from /public/avatars.
 * 
 * Figma-level polish:
 * - Smooth cubic-bezier easing on all transitions
 * - Focus ring for keyboard accessibility
 * - Hover states with subtle scale
 * - Design system tokens only (no hardcoded colors)
 */

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import {
    QuestionScreen,
    QuestionHeader,
    ContinueButton,
    useKeyboardNavigation,
} from '../ui';
import { AVATAR_OPTIONS, DEFAULT_AVATAR_ID } from '@/domain/user/avatars';

interface AvatarSelectionScreenProps {
    value: string | null;
    onChange: (avatarId: string) => void;
    onContinue: () => void;
    onBack: () => void;
}

export function AvatarSelectionScreen({
    value,
    onChange,
    onContinue,
    onBack
}: AvatarSelectionScreenProps) {
    // Default to first avatar if nothing selected
    const selectedId = value || DEFAULT_AVATAR_ID;

    useKeyboardNavigation({
        onEnter: onContinue,
        onBack,
        onNumber: (num) => {
            const avatar = AVATAR_OPTIONS[num - 1];
            if (avatar) {
                onChange(avatar.id);
            }
        },
    });

    return (
        <QuestionScreen onBack={onBack}>
            <QuestionHeader
                title="Choose your avatar"
                subtitle="Pick the runner that represents you."
            />

            <div className="grid grid-cols-3 gap-4 mb-8">
                {AVATAR_OPTIONS.map((avatar, index) => {
                    const isSelected = selectedId === avatar.id;

                    return (
                        <motion.button
                            key={avatar.id}
                            onClick={() => onChange(avatar.id)}
                            className="relative aspect-square rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            style={{
                                border: isSelected
                                    ? '3px solid var(--color-accent)'
                                    : '2px solid var(--border-base)',
                                // Focus ring uses accent color
                                // @ts-expect-error CSS variable
                                '--tw-ring-color': 'var(--color-accent)',
                                '--tw-ring-offset-color': 'var(--bg-base)',
                            }}
                            initial={false}
                            animate={{
                                scale: isSelected ? 1.05 : 1,
                                boxShadow: isSelected
                                    ? '0 12px 40px color-mix(in srgb, var(--color-accent) 35%, transparent)'
                                    : '0 0 0 transparent',
                            }}
                            whileHover={{ scale: isSelected ? 1.05 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
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
                                sizes="(max-width: 768px) 30vw, 120px"
                                priority={index < 3}
                            />

                            {/* Selection checkmark - animated entry */}
                            {isSelected && (
                                <motion.div
                                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--color-accent)' }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 20,
                                    }}
                                >
                                    <Check
                                        size={14}
                                        strokeWidth={3}
                                        style={{ color: 'var(--bg-base)' }}
                                    />
                                </motion.div>
                            )}

                            {/* Keyboard shortcut badge */}
                            <div
                                className="absolute bottom-2 left-2 w-5 h-5 rounded font-mono flex items-center justify-center"
                                style={{
                                    background: 'var(--bg-overlay)',
                                    color: 'var(--text-subtle)',
                                    fontSize: '10px',
                                }}
                            >
                                {index + 1}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selected avatar name with fade transition */}
            <motion.p
                key={selectedId}
                className="text-center mb-6 v3-body-sm"
                style={{ color: 'var(--text-muted)' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
            >
                {AVATAR_OPTIONS.find(a => a.id === selectedId)?.name}
            </motion.p>

            <ContinueButton
                onClick={() => {
                    // Ensure we have a selection before continuing
                    if (!value) onChange(DEFAULT_AVATAR_ID);
                    onContinue();
                }}
            />
        </QuestionScreen>
    );
}
