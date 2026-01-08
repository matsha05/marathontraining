import { NextResponse } from 'next/server';
import { deauthorizeStrava } from '@/infrastructure/strava/api';
import { deleteStravaTokens, getStravaTokensByAthleteId } from '@/infrastructure/strava/store';
import { getValidAccessToken } from '@/infrastructure/strava/token';
import { requireAthleteId } from '@/infrastructure/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    let warning: string | null = null;
    const tokenRow = await getStravaTokensByAthleteId(auth.athleteId);
    if (tokenRow) {
        try {
            const accessToken = await getValidAccessToken(tokenRow, () => getStravaTokensByAthleteId(auth.athleteId));
            await deauthorizeStrava(accessToken);
        } catch (error) {
            warning = error instanceof Error ? error.message : 'Strava deauthorization failed';
        }
    }

    await deleteStravaTokens(auth.athleteId);

    return NextResponse.json({ ok: true, warning });
}
