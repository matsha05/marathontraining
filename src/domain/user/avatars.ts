/**
 * Avatar Constants
 * 
 * Available user avatars for profile selection.
 * These are stylized runner illustrations in /public/avatars.
 */

export interface AvatarOption {
    id: string;
    name: string;
    path: string;
    description: string;
}

/**
 * Available avatar options
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
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
];

/**
 * Default avatar for new users
 */
export const DEFAULT_AVATAR_ID = 'marathon';

/**
 * Get avatar by ID
 */
export function getAvatarById(id: string): AvatarOption | undefined {
    return AVATAR_OPTIONS.find(a => a.id === id);
}

/**
 * Get avatar path by ID (with fallback)
 */
export function getAvatarPath(id: string | null | undefined): string {
    const avatar = id ? getAvatarById(id) : undefined;
    return avatar?.path ?? AVATAR_OPTIONS[0].path;
}
