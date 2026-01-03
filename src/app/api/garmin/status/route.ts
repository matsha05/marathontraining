import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import { getGarminTokensByAthleteId } from '@/infrastructure/garmin/store';
import { resolveAthleteId } from '@/infrastructure/garmin/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { athleteId } = await resolveAthleteId(request);

    if (!athleteId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tokenRow = await getGarminTokensByAthleteId(athleteId);

    const supabase = getSupabaseServerClient();
    const { data: lastActivity } = await supabase
        .from('garmin_activities')
        .select('start_time')
        .eq('athlete_id', athleteId)
        .in('source', ['garmin', 'manual', 'garmin_export'])
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

    const { data: lastHealth } = await supabase
        .from('garmin_health_metrics')
        .select('summary_date')
        .eq('athlete_id', athleteId)
        .order('summary_date', { ascending: false })
        .limit(1)
        .maybeSingle();

    return NextResponse.json({
        connected: Boolean(tokenRow),
        garminUserId: tokenRow?.garmin_user_id,
        accessTokenExpiresAt: tokenRow?.access_token_expires_at ?? null,
        refreshTokenExpiresAt: tokenRow?.refresh_token_expires_at ?? null,
        lastActivityAt: lastActivity?.start_time ?? null,
        lastHealthDate: lastHealth?.summary_date ?? null,
    });
}
