import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

const DISALLOW_PATHS = [
    '/auth',
    '/login',
    '/signup',
    '/onboarding',
    '/dashboard',
    '/plan',
    '/settings',
    '/workout',
    '/regenerate',
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: DISALLOW_PATHS,
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
