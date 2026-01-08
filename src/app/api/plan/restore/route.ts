import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAthleteId } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

const bodySchema = z.object({
    planId: z.string().min(1),
});

export async function POST(request: NextRequest) {
    const auth = await requireAthleteId(request);
    if (auth.response) return auth.response;

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

    const supabase = createSupabaseRequestClient(request);
    const { error } = await supabase.rpc('restore_training_plan', {
        plan_backup: JSON.parse(JSON.stringify({ target_plan_id: parsed.data.planId })),
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
