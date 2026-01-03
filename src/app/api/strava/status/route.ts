import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import { getStravaTokensByAthleteId } from '@/infrastructure/strava/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

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

    const supabase = getSupabaseServerClient();
    const { data: lastActivity } = await supabase
        .from('garmin_activities')
        .select('start_time')
        .eq('athlete_id', athleteId)
        .eq('source', 'strava')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

    return NextResponse.json({
        connected: true,
        stravaAthleteId: tokenRow.strava_athlete_id,
        accessTokenExpiresAt: tokenRow.access_token_expires_at,
        lastActivityAt: lastActivity?.start_time ?? null,
    });
}
