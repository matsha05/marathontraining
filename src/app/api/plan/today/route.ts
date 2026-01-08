import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { todayDateKey } from '@/lib/dates';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    const supabase = createSupabaseRequestClient(request);
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .select('id')
        .eq('athlete_id', auth.athleteId)
        .eq('is_active', true)
        .single();

    if (planError) {
        if (planError.code === 'PGRST116') {
            return NextResponse.json({ workout: null });
        }
        return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    const today = todayDateKey();
    const { data, error } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', plan.id)
        .eq('scheduled_date', today)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ workout: null });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workout: data ?? null });
}
