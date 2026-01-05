"use client";

import { motion } from "framer-motion";

interface AnimatedIconProps {
    className?: string;
    size?: number;
}

/**
 * Animated Check Icon
 * Use for: Success states, completed actions, saved confirmations
 */
export function AnimatedCheck({ className = "", size = 24 }: AnimatedIconProps) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.path
                d="M20 6L9 17L4 12"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
        </motion.svg>
    );
}

/**
 * Animated Spinner Icon
 * Use for: Loading states, async operations
 */
export function AnimatedSpinner({ className = "", size = 24 }: AnimatedIconProps) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </motion.svg>
    );
}

/**
 * Animated Settings Icon
 * Use for: Settings button hover, opening settings
 */
export function AnimatedSettings({ className = "", size = 24, animate = false }: AnimatedIconProps & { animate?: boolean }) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            animate={animate ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </motion.svg>
    );
}

/**
 * Animated Download Icon
 * Use for: Download buttons, export actions
 */
export function AnimatedDownload({ className = "", size = 24, animate = false }: AnimatedIconProps & { animate?: boolean }) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            />
            <motion.polyline
                points="7 10 12 15 17 10"
                animate={animate ? { y: [0, 2, 0] } : { y: 0 }}
                transition={{ duration: 0.5, repeat: animate ? Infinity : 0, repeatDelay: 0.5 }}
            />
            <motion.line
                x1="12"
                y1="15"
                x2="12"
                y2="3"
                animate={animate ? { y: [0, 2, 0] } : { y: 0 }}
                transition={{ duration: 0.5, repeat: animate ? Infinity : 0, repeatDelay: 0.5 }}
            />
        </motion.svg>
    );
}

/**
 * Animated Sparkles Icon
 * Use for: AI/Magic features, generation complete
 */
export function AnimatedSparkles({ className = "", size = 24 }: AnimatedIconProps) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.1, 1], opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <motion.path
                d="M20 3v4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
            />
            <motion.path
                d="M22 5h-4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
            />
            <motion.path
                d="M4 17v2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
            />
            <motion.path
                d="M5 18H3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
            />
        </motion.svg>
    );
}

/**
 * Animated Circle Check Icon
 * Use for: Success states with more emphasis
 */
export function AnimatedCircleCheck({ className = "", size = 24 }: AnimatedIconProps) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <motion.circle
                cx="12"
                cy="12"
                r="10"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            />
            <motion.path
                d="m9 12 2 2 4-4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
            />
        </motion.svg>
    );
}

/**
 * Animated Refresh Icon
 * Use for: Refresh/sync buttons
 */
export function AnimatedRefresh({ className = "", size = 24, animate = false }: AnimatedIconProps & { animate?: boolean }) {
    return (
        <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            animate={animate ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
        </motion.svg>
    );
}
