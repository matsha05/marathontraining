import { NextRequest, NextResponse } from 'next/server';
import { getStravaTokensByAthleteId, getLatestStravaActivity } from '@/infrastructure/strava/store';
import { requireAthleteId } from '@/infrastructure/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

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
}
