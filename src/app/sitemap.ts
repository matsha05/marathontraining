import type { MetadataRoute } from 'next';
import { buildSiteUrl } from '@/lib/site';

const STATIC_ROUTES = [
    '/',
    '/browse',
    '/philosophy',
    '/methodology',
    '/privacy',
    '/terms',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return STATIC_ROUTES.map(route => ({
        url: buildSiteUrl(route),
        lastModified,
    }));
}
