import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';
import { trainingPlanSchema } from '@/domain/plan/schemas';
import { buildPlannedWorkoutInserts, buildTrainingPlanInsert } from '@/domain/plan/persistence';

export const runtime = 'nodejs';

const bodySchema = z.object({
    plan: trainingPlanSchema,
});

export const POST = withAuth(async (request: NextRequest, auth) => {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Invalid request', details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { plan } = parsed.data;
    const planRow = buildTrainingPlanInsert(plan, auth.athleteId);
    const workoutRows = buildPlannedWorkoutInserts(plan, auth.athleteId);

    const supabase = createSupabaseRequestClient(request);
    const { error } = await supabase.rpc('save_training_plan', {
        plan: planRow,
        workouts: workoutRows,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
});
