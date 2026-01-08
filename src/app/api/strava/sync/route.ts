import { NextRequest, NextResponse } from 'next/server';
import { getStravaTokensByAthleteId, upsertStravaActivity } from '@/infrastructure/strava/store';
import { getValidAccessToken } from '@/infrastructure/strava/token';
import { fetchStravaActivities } from '@/infrastructure/strava/api';
import { mapStravaActivity } from '@/infrastructure/strava/processor';
import { withAuth } from '@/infrastructure/auth';
import { stravaSyncQuerySchema } from '@/infrastructure/strava/schemas';

export const runtime = 'nodejs';

const DEFAULT_DAYS = 90;
const DEFAULT_LIMIT = 50;

export const POST = withAuth(async (request: NextRequest, auth) => {
    const tokenRow = await getStravaTokensByAthleteId(auth.athleteId);
    if (!tokenRow) {
        return NextResponse.json({ error: 'Strava not connected' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const parsedQuery = stravaSyncQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }
    const days = parsedQuery.data.days ?? DEFAULT_DAYS;
    const limit = parsedQuery.data.limit ?? DEFAULT_LIMIT;
    const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

    const accessToken = await getValidAccessToken(tokenRow, () => getStravaTokensByAthleteId(auth.athleteId));
    const activities = await fetchStravaActivities(accessToken, { after, perPage: limit });

    let imported = 0;
    for (const activity of activities) {
        const activityId = Number(activity.id);
        if (!Number.isFinite(activityId)) continue;
        const summary = mapStravaActivity(activity);

        await upsertStravaActivity(
            tokenRow.athlete_id,
            `strava:${activityId}`,
            { ...summary, source: 'strava' },
            activity as Record<string, unknown>
        );

        imported += 1;
    }

    return NextResponse.json({
        ok: true,
        imported,
        total: activities.length,
        days,
    });
});
