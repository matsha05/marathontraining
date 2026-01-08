import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';

type SupabaseRequestClient = ReturnType<typeof createSupabaseRequestClient>;

type ActivePlanResult<T> =
    | { plan: T | null; supabase: SupabaseRequestClient; athleteId: string }
    | { response: NextResponse };

export async function fetchActivePlan<T>(
    request: NextRequest,
    select: string
): Promise<ActivePlanResult<T>> {
    const auth = await requireAthleteId(request);
    if (auth.response) return { response: auth.response };

    const supabase = createSupabaseRequestClient(request);
    const { data, error } = await supabase
        .from('training_plans')
        .select(select)
        .eq('athlete_id', auth.athleteId)
        .eq('is_active', true)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return { plan: null, supabase, athleteId: auth.athleteId };
        }
        return { response: NextResponse.json({ error: error.message }, { status: 500 }) };
    }

    return { plan: data as T, supabase, athleteId: auth.athleteId };
}
