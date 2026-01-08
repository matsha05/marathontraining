import { NextRequest, NextResponse } from 'next/server';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { weekQuerySchema } from '@/domain/plan/schemas';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

    const { searchParams } = new URL(request.url);
    const parsedQuery = weekQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }

    const supabase = createSupabaseRequestClient(request);
    const { data: plan, error: planError } = await supabase
        .from('training_plans')
        .select('id')
        .eq('athlete_id', auth.athleteId)
        .eq('is_active', true)
        .single();

    if (planError) {
        if (planError.code === 'PGRST116') {
            return NextResponse.json({ workouts: [] });
        }
        return NextResponse.json({ error: planError.message }, { status: 500 });
    }

    const { data, error } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', plan.id)
        .order('scheduled_date', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const workouts = (data || []).filter((workout) => {
        const prescription = workout.prescription as Record<string, unknown>;
        return prescription.weekNumber === parsedQuery.data.week;
    });

    return NextResponse.json({ workouts });
}
