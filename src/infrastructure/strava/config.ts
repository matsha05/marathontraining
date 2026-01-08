export const stravaConfig = {
    clientId: process.env.STRAVA_CLIENT_ID || '',
    clientSecret: process.env.STRAVA_CLIENT_SECRET || '',
    redirectUri: process.env.STRAVA_REDIRECT_URI || '',
    authUrl: process.env.STRAVA_AUTH_URL || 'https://www.strava.com/oauth/authorize',
    tokenUrl: process.env.STRAVA_TOKEN_URL || 'https://www.strava.com/oauth/token',
    apiUrl: process.env.STRAVA_API_URL || 'https://www.strava.com/api/v3',
    webhookVerifyToken: process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || '',
    successRedirect: process.env.STRAVA_SUCCESS_REDIRECT || '/settings?strava=connected',
    failureRedirect: process.env.STRAVA_FAILURE_REDIRECT || '/settings?strava=error',
    scope: process.env.STRAVA_SCOPE || 'activity:read_all',
    processingMode: process.env.STRAVA_WEBHOOK_PROCESSING_MODE || 'queue',
    processingSecret: process.env.STRAVA_PROCESSING_SECRET || '',
};

export type StravaConfigKey = keyof typeof stravaConfig;

const STRAVA_ENV_MAP: Record<StravaConfigKey, string> = {
    clientId: 'STRAVA_CLIENT_ID',
    clientSecret: 'STRAVA_CLIENT_SECRET',
    redirectUri: 'STRAVA_REDIRECT_URI',
    authUrl: 'STRAVA_AUTH_URL',
    tokenUrl: 'STRAVA_TOKEN_URL',
    apiUrl: 'STRAVA_API_URL',
    webhookVerifyToken: 'STRAVA_WEBHOOK_VERIFY_TOKEN',
    successRedirect: 'STRAVA_SUCCESS_REDIRECT',
    failureRedirect: 'STRAVA_FAILURE_REDIRECT',
    scope: 'STRAVA_SCOPE',
    processingMode: 'STRAVA_WEBHOOK_PROCESSING_MODE',
    processingSecret: 'STRAVA_PROCESSING_SECRET',
};

export function requireStravaConfig(required: StravaConfigKey[]) {
    const missing = required.filter((key) => !stravaConfig[key]);
    return { ok: missing.length === 0, missing };
}

export function assertStravaConfig(required: StravaConfigKey[]) {
    const { ok, missing } = requireStravaConfig(required);
    if (!ok) {
        const envs = missing.map((key) => STRAVA_ENV_MAP[key]).join(' or ');
        throw new Error(`Missing ${envs}`);
    }
    return stravaConfig;
}
