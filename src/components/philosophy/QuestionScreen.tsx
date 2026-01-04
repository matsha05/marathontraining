'use client';

import { motion } from 'framer-motion';

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
                    className="fixed top-8 left-6 text-sm text-white/30 hover:text-white/60 transition-colors"
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
                    className="text-3xl md:text-4xl font-light text-white/90 mb-4"
                >
                    {question}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-lg text-white/40 mb-12"
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
                            className="w-full p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all text-left group"
                        >
                            <p className="text-lg text-white/80 group-hover:text-white transition-colors">
                                {option.label}
                            </p>
                            <p className="text-sm text-white/40 mt-1">
                                {option.description}
                            </p>
                        </motion.button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
