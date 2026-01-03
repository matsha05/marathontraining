import { NextResponse } from 'next/server';
import { deleteGarminRegistration } from '@/infrastructure/garmin/api';
import { deleteGarminTokens, getGarminTokensByAthleteId } from '@/infrastructure/garmin/store';
import { getValidAccessToken } from '@/infrastructure/garmin/token';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let warning: string | null = null;
    const tokenRow = await getGarminTokensByAthleteId(athleteId);
    if (tokenRow) {
        try {
            const accessToken = await getValidAccessToken(tokenRow, () => getGarminTokensByAthleteId(athleteId));
            await deleteGarminRegistration(accessToken);
        } catch (error) {
            warning = error instanceof Error ? error.message : 'Garmin deregistration failed';
        }
    }

    await deleteGarminTokens(athleteId);

    return NextResponse.json({ ok: true, warning });
}
