import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    const supabase = createSupabaseRequestClient(request);
    const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('athlete_id', auth.athleteId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data || [] });
}
