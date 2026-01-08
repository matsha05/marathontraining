import { NextResponse } from 'next/server';
import { deauthorizeStrava } from '@/infrastructure/strava/api';
import { deleteStravaTokens, getStravaTokensByAthleteId } from '@/infrastructure/strava/store';
import { getValidAccessToken } from '@/infrastructure/strava/token';
import { withAuth } from '@/infrastructure/auth';

export const runtime = 'nodejs';

export const POST = withAuth(async (request: Request, auth) => {
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
});
