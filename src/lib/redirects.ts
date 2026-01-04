export type RedirectGuardOptions = {
    allowApi?: boolean;
    blockedPrefixes?: string[];
};

const DEFAULT_BLOCKED_PREFIXES = ['/auth', '/login', '/signup'];

export function isSafeRedirectPath(
    value: string | null | undefined,
    options: RedirectGuardOptions = {}
): value is string {
    if (!value || typeof value !== 'string') return false;
    if (!value.startsWith('/')) return false;
    if (value.startsWith('//') || value.startsWith('/\\')) return false;
    if (value.includes('://')) return false;

    const blockedPrefixes = options.blockedPrefixes ?? DEFAULT_BLOCKED_PREFIXES;
    if (blockedPrefixes.some(prefix => value === prefix || value.startsWith(`${prefix}/`))) {
        return false;
    }

    if (!options.allowApi && value.startsWith('/api')) return false;

    return true;
}

export function getSafeRedirectPath(
    value: string | null | undefined,
    fallback: string,
    options: RedirectGuardOptions = {}
): string {
    return isSafeRedirectPath(value, options) ? value : fallback;
}
