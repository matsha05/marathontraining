import { NextRequest, NextResponse } from 'next/server';
import { weekQuerySchema } from '@/domain/plan/schemas';
import { fetchActivePlan } from '@/app/api/plan/helpers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const parsedQuery = weekQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }

    const activePlan = await fetchActivePlan<{ id: string }>(request, 'id');
    if ('response' in activePlan) return activePlan.response;
    if (!activePlan.plan) return NextResponse.json({ workouts: [] });

    const { supabase, plan } = activePlan;

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
