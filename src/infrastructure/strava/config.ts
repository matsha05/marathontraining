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
