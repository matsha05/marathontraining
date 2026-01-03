import { NextResponse } from 'next/server';
import { deauthorizeStrava } from '@/infrastructure/strava/api';
import { deleteStravaTokens, getStravaTokensByAthleteId } from '@/infrastructure/strava/store';
import { getValidAccessToken } from '@/infrastructure/strava/token';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let warning: string | null = null;
    const tokenRow = await getStravaTokensByAthleteId(athleteId);
    if (tokenRow) {
        try {
            const accessToken = await getValidAccessToken(tokenRow, () => getStravaTokensByAthleteId(athleteId));
            await deauthorizeStrava(accessToken);
        } catch (error) {
            warning = error instanceof Error ? error.message : 'Strava deauthorization failed';
        }
    }

    await deleteStravaTokens(athleteId);

    return NextResponse.json({ ok: true, warning });
}
