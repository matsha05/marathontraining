import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    const supabase = createSupabaseRequestClient(request);
    const { error } = await supabase
        .from('training_plans')
        .update({ is_active: false })
        .eq('athlete_id', auth.athleteId)
        .eq('is_active', true);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
