import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { reconstructPlan } from '@/domain/plan/serialization';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    const supabase = createSupabaseRequestClient(request);
    const { data: planRow, error: planError } = await supabase
        .from('training_plans')
        .select('*')
        .eq('athlete_id', auth.athleteId)
        .eq('is_active', true)
        .single();

    if (planError) {
        if (planError.code === 'PGRST116') {
            return NextResponse.json({ plan: null });
        }
        return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    const { data: workouts, error: workoutsError } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', planRow.id)
        .order('scheduled_date', { ascending: true });

    if (workoutsError) {
        return NextResponse.json({ error: workoutsError.message }, { status: 500 });
    }

    const plan = reconstructPlan(planRow, workouts || []);
    return NextResponse.json({ plan });
}
