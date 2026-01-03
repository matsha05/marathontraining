import { NextRequest, NextResponse } from 'next/server';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';
import { getStravaTokensByAthleteId } from '@/infrastructure/strava/store';
import { getValidAccessToken } from '@/infrastructure/strava/token';
import { fetchStravaActivities } from '@/infrastructure/strava/api';
import { insertGarminActivity } from '@/infrastructure/garmin/store';
import { logCompletedWorkoutFromActivity } from '@/infrastructure/garmin/activity-log';
import { mapStravaActivity } from '@/infrastructure/strava/processor';

export const runtime = 'nodejs';

const DEFAULT_DAYS = 90;
const DEFAULT_LIMIT = 50;

export async function POST(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);
    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenRow = await getStravaTokensByAthleteId(athleteId);
    if (!tokenRow) {
        return NextResponse.json({ error: 'Strava not connected' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const daysParam = Number(searchParams.get('days'));
    const limitParam = Number(searchParams.get('limit'));
    const days = Number.isFinite(daysParam) && daysParam > 0 ? Math.min(daysParam, 365) : DEFAULT_DAYS;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 200) : DEFAULT_LIMIT;
    const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const accessToken = await getValidAccessToken(tokenRow, () => getStravaTokensByAthleteId(athleteId));
    const activities = await fetchStravaActivities(accessToken, { after, perPage: limit });

    let imported = 0;
    for (const activity of activities) {
        const activityId = Number(activity.id);
        if (!Number.isFinite(activityId)) continue;
        const summary = mapStravaActivity(activity);

        await insertGarminActivity(
            tokenRow.athlete_id,
            null,
            `strava:${activityId}`,
            summary.activityType ?? null,
            { ...summary, source: 'strava' },
            activity,
            null,
            null,
            'strava'
        );

        await logCompletedWorkoutFromActivity(tokenRow.athlete_id, summary, { allowUnmatched: false });
        imported += 1;
    }

    return NextResponse.json({
        ok: true,
        imported,
        total: activities.length,
        days,
    });
}
