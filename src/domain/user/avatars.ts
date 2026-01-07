/**
 * Avatar Domain
 * 
 * Strict types and constants for user profile avatars.
 * All avatar IDs are compile-time validated.
 */

// =============================================================================
// STRICT AVATAR ID TYPE
// =============================================================================

/**
 * Valid avatar IDs - compile-time validated union type.
 * Add new avatars here and TypeScript will enforce usage everywhere.
 */
export type AvatarId =
    | 'marathon'
    | 'runner_blue'
    | 'runner_green'
    | 'runner_purple'
    | 'sprinter'
    | 'trail';

/**
 * Type guard to validate avatar ID at runtime
 */
export function isValidAvatarId(id: unknown): id is AvatarId {
    return typeof id === 'string' && AVATAR_IDS.includes(id as AvatarId);
}

/**
 * All valid avatar IDs as array (derived from type)
 */
export const AVATAR_IDS: readonly AvatarId[] = [
    'marathon',
    'runner_blue',
    'runner_green',
    'runner_purple',
    'sprinter',
    'trail',
] as const;

// =============================================================================
// AVATAR METADATA
// =============================================================================

export interface AvatarOption {
    id: AvatarId;
    name: string;
    path: string;
    description: string;
}

/**
 * Complete avatar metadata for UI display
 */
export const AVATAR_OPTIONS: readonly AvatarOption[] = [
    {
        id: 'marathon',
        name: 'Marathon Runner',
        path: '/avatars/avatar_marathon.png',
        description: 'Classic marathoner in motion',
    },
    {
        id: 'runner_blue',
        name: 'Distance Runner',
        path: '/avatars/avatar_runner_blue.png',
        description: 'Cool blue runner aesthetic',
    },
    {
        id: 'runner_green',
        name: 'Trail Runner',
        path: '/avatars/avatar_runner_green.png',
        description: 'Nature-inspired runner',
    },
    {
        id: 'runner_purple',
        name: 'Speed Runner',
        path: '/avatars/avatar_runner_purple.png',
        description: 'Vibrant purple theme',
    },
    {
        id: 'sprinter',
        name: 'Sprinter',
        path: '/avatars/avatar_sprinter.png',
        description: 'Explosive running power',
    },
    {
        id: 'trail',
        name: 'Trail Explorer',
        path: '/avatars/avatar_trail_runner.png',
        description: 'Off-road adventure',
    },
] as const;

/**
 * Default avatar for new users
 */
export const DEFAULT_AVATAR_ID: AvatarId = 'marathon';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get avatar metadata by ID
 */
export function getAvatarById(id: AvatarId): AvatarOption {
    const avatar = AVATAR_OPTIONS.find(a => a.id === id);
    if (!avatar) {
        // This should never happen with strict typing, but fallback just in case
        return AVATAR_OPTIONS[0];
    }
    return avatar;
}

/**
 * Get avatar path by ID (with fallback for null/undefined)
 */
export function getAvatarPath(id: AvatarId | string | null | undefined): string {
    if (!id) return AVATAR_OPTIONS[0].path;

    const avatar = AVATAR_OPTIONS.find(a => a.id === id);
    return avatar?.path ?? AVATAR_OPTIONS[0].path;
}

/**
 * Safely parse an avatar ID from unknown input
 */
export function parseAvatarId(input: unknown): AvatarId {
    if (isValidAvatarId(input)) {
        return input;
    }
    return DEFAULT_AVATAR_ID;
}
