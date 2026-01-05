'use client';

import { motion } from 'framer-motion';

/**
 * QuestionScreen - Quiz question component
 * V2 Design System - 100% token usage
 */

interface Option<T> {
    value: T;
    label: string;
    description: string;
}

interface QuestionScreenProps<T> {
    question: string;
    subtitle: string;
    options: Option<T>[];
    onSelect: (value: T) => void;
    onBack?: () => void;
    backLabel?: string;
}

export function QuestionScreen<T>({
    question,
    subtitle,
    options,
    onSelect,
    onBack,
    backLabel = 'Back',
}: QuestionScreenProps<T>) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
        >
            {/* Back button */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="fixed top-8 left-6 text-sm transition-colors"
                    style={{ color: 'var(--v2-text-subtle)' }}
                >
                    ← {backLabel}
                </button>
            )}

            <div className="max-w-xl w-full text-center">
                {/* Question */}
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl md:text-4xl font-light mb-4"
                    style={{ color: 'var(--v2-text-primary)' }}
                >
                    {question}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg mb-12"
                    style={{ color: 'var(--v2-text-muted)' }}
                >
                    {subtitle}
                </motion.p>

                {/* Options */}
                <div className="space-y-3">
                    {options.map((option, i) => (
                        <motion.button
                            key={String(option.value)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.05 }}
                            onClick={() => onSelect(option.value)}
                            className="w-full p-5 rounded-xl border transition-all text-left group"
                            style={{
                                background: 'var(--v2-bg-hover)',
                                borderColor: 'var(--v2-border-hover)',
                            }}
                        >
                            <p
                                className="text-lg transition-colors"
                                style={{ color: 'var(--v2-text-primary)' }}
                            >
                                {option.label}
                            </p>
                            <p
                                className="text-sm mt-1"
                                style={{ color: 'var(--v2-text-muted)' }}
                            >
                                {option.description}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
