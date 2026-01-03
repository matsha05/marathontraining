export const garminConfig = {
    clientId: process.env.GARMIN_CLIENT_ID || '',
    clientSecret: process.env.GARMIN_CLIENT_SECRET || '',
    redirectUri: process.env.GARMIN_REDIRECT_URI || '',
    authUrl: process.env.GARMIN_AUTH_URL || 'https://connect.garmin.com/oauth2Confirm',
    tokenUrl: process.env.GARMIN_TOKEN_URL || 'https://diauth.garmin.com/di-oauth2-service/oauth/token',
    userIdUrl: process.env.GARMIN_USER_ID_URL || 'https://apis.garmin.com/wellness-api/rest/user/id',
    registrationUrl: process.env.GARMIN_REGISTRATION_URL || 'https://apis.garmin.com/wellness-api/rest/user/registration',
    webhookSecret: process.env.GARMIN_WEBHOOK_SECRET || '',
    successRedirect: process.env.GARMIN_SUCCESS_REDIRECT || '/settings?garmin=connected',
    failureRedirect: process.env.GARMIN_FAILURE_REDIRECT || '/settings?garmin=error',
    scope: process.env.GARMIN_SCOPE || '',
    activityDetailUrlTemplate: process.env.GARMIN_ACTIVITY_DETAIL_URL_TEMPLATE || '',
    healthDetailUrlTemplate: process.env.GARMIN_HEALTH_DETAIL_URL_TEMPLATE || '',
    allowedDownloadHosts: parseHosts(process.env.GARMIN_ALLOWED_DOWNLOAD_HOSTS),
    processingMode: process.env.GARMIN_WEBHOOK_PROCESSING_MODE || 'queue',
    processingSecret: process.env.GARMIN_PROCESSING_SECRET || '',
    maxFitSizeBytes: parseInt(process.env.GARMIN_MAX_FIT_SIZE_BYTES || '0', 10) || 20 * 1024 * 1024,
    maxExportSizeBytes: parseInt(process.env.GARMIN_EXPORT_MAX_BYTES || '0', 10) || 200 * 1024 * 1024,
};

function parseHosts(value: string | undefined): string[] {
    if (!value) {
        return ['*.garmin.com'];
    }
    return value
        .split(',')
        .map(host => host.trim())
        .filter(Boolean);
}
