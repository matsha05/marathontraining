import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { planIdQuerySchema } from '@/domain/plan/schemas';

export const runtime = 'nodejs';

export const GET = withAuth(async (request: NextRequest, auth) => {
    const { searchParams } = new URL(request.url);
    const parsedQuery = planIdQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }

    const supabase = createSupabaseRequestClient(request);
    const { data, error } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', parsedQuery.data.planId)
        .eq('athlete_id', auth.athleteId)
        .order('scheduled_date', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workouts: data || [] });
});
