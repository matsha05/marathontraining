import { NextRequest, NextResponse } from 'next/server';
import { getStravaTokensByAthleteId, getLatestStravaActivity } from '@/infrastructure/strava/store';
import { withAuth } from '@/infrastructure/auth';

export const runtime = 'nodejs';

export const GET = withAuth(async (request: NextRequest, auth) => {
    const tokenRow = await getStravaTokensByAthleteId(auth.athleteId);

    if (!tokenRow) {
        return NextResponse.json({ connected: false });
    }

    const lastActivity = await getLatestStravaActivity(auth.athleteId);

    return NextResponse.json({
        connected: true,
        stravaAthleteId: tokenRow.strava_athlete_id,
        accessTokenExpiresAt: tokenRow.access_token_expires_at,
        lastActivityAt: lastActivity?.start_time ?? null,
    });
});
