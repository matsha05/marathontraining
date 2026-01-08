import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/infrastructure/auth';
import { createSupabaseRequestClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

export const GET = withAuth(async (request: NextRequest, auth) => {
    const supabase = createSupabaseRequestClient(request);
    const { data, error } = await supabase
        .from('training_plans')
        .select('*')
        .eq('athlete_id', auth.athleteId)
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ plans: data || [] });
});
