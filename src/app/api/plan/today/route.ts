import { NextRequest, NextResponse } from 'next/server';
import { todayDateKey } from '@/lib/dates';
import { fetchActivePlan } from '@/app/api/plan/helpers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    const activePlan = await fetchActivePlan<{ id: string }>(request, 'id');
    if ('response' in activePlan) return activePlan.response;
    if (!activePlan.plan) return NextResponse.json({ workout: null });

    const { supabase, plan } = activePlan;

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
