import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/infrastructure/auth';
import { createSupabaseRequestClient, getSupabaseServerClient } from '@/infrastructure/supabase/server';
import { trainingPlanSchema } from '@/domain/plan/schemas';
import type { TrainingPlanPayload } from '@/domain/plan/schemas';
import { buildPlannedWorkoutInserts, buildTrainingPlanInsert } from '@/domain/plan/persistence';

export const runtime = 'nodejs';

const bodySchema = z.object({
    plan: trainingPlanSchema,
});

type PlanParseResult =
    | { plan: TrainingPlanPayload }
    | { response: NextResponse };

async function parsePlanRequest(request: NextRequest): Promise<PlanParseResult> {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return { response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) };
    }

    const parsed = bodySchema.safeParse(payload);
    if (!parsed.success) {
        return {
            response: NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            ),
        };
    }

    return parsed.data;
}

async function ensureAthleteProfile(
    athleteId: string,
    athleteName: string
): Promise<NextResponse | null> {
    const adminClient = getSupabaseServerClient();
    const { error } = await adminClient
        .from('athletes')
        .upsert(
            { id: athleteId, name: athleteName || 'Athlete' },
            { onConflict: 'id', ignoreDuplicates: true }
        );

    if (!error) return null;
    return NextResponse.json(
        { error: 'Failed to ensure athlete profile', details: error },
        { status: 500 }
    );
}

export const POST = withAuth(async (request: NextRequest, auth) => {
    const parsed = await parsePlanRequest(request);
    if ('response' in parsed) return parsed.response;
    const { plan } = parsed;

    const athleteName = typeof plan.athleteName === 'string' ? plan.athleteName.trim() : '';
    const profileResponse = await ensureAthleteProfile(auth.athleteId, athleteName);
    if (profileResponse) return profileResponse;

    const planRow = buildTrainingPlanInsert(plan, auth.athleteId);
    const workoutRows = buildPlannedWorkoutInserts(plan, auth.athleteId);

    const supabase = createSupabaseRequestClient(request);
    const { error } = await supabase.rpc('save_training_plan', {
        plan: planRow,
        workouts: workoutRows,
    });

    if (error) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
            },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
});
