import { NextRequest, NextResponse } from 'next/server';
import { getStravaTokensByAthleteId, getLatestStravaActivity } from '@/infrastructure/strava/store';
import { resolveAthleteId } from '@/infrastructure/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenRow = await getStravaTokensByAthleteId(athleteId);

    if (!tokenRow) {
        return NextResponse.json({ connected: false });
    }

    const lastActivity = await getLatestStravaActivity(athleteId);

    return NextResponse.json({
        connected: true,
        stravaAthleteId: tokenRow.strava_athlete_id,
        accessTokenExpiresAt: tokenRow.access_token_expires_at,
        lastActivityAt: lastActivity?.start_time ?? null,
    });
}
