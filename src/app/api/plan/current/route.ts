import { NextRequest, NextResponse } from 'next/server';
import { reconstructPlan } from '@/domain/plan/serialization';
import { fetchActivePlan } from '@/app/api/plan/helpers';
import type { Database } from '@/infrastructure/supabase/types';

export const runtime = 'nodejs';

type DbTrainingPlan = Database['public']['Tables']['training_plans']['Row'];

export async function GET(request: NextRequest) {
    const activePlan = await fetchActivePlan<DbTrainingPlan>(request, '*');
    if ('response' in activePlan) return activePlan.response;
    if (!activePlan.plan) return NextResponse.json({ plan: null });

    const { supabase, plan } = activePlan;

    const { data: workouts, error: workoutsError } = await supabase
        .from('planned_workouts')
        .select('*')
        .eq('plan_id', plan.id)
        .order('scheduled_date', { ascending: true });

    if (workoutsError) {
        return NextResponse.json({ error: workoutsError.message }, { status: 500 });
    }

    const fullPlan = reconstructPlan(plan, workouts || []);
    return NextResponse.json({ plan: fullPlan });
}
