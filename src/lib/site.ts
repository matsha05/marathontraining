const DEFAULT_SITE_URL = 'https://www.thelonggame.win';

const ensureScheme = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('localhost') || url.startsWith('127.0.0.1')) return `http://${url}`;
    return `https://${url}`;
};

const normalizeSiteUrl = (url: string) => {
    const withScheme = ensureScheme(url.trim());
    return withScheme.endsWith('/') ? withScheme.slice(0, -1) : withScheme;
};

export const SITE_URL = normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
);

export const SITE_HOST = (() => {
    try {
        return new URL(SITE_URL).host;
    } catch {
        return '';
    }
})();

export const buildSiteUrl = (path: string) => {
    if (!path) return SITE_URL;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE_URL}${normalizedPath}`;
};
