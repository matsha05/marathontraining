import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/infrastructure/auth';
import { createSupabaseRequestClient, getSupabaseServerClient } from '@/infrastructure/supabase/server';

export const runtime = 'nodejs';

export const POST = withAuth(async (request: NextRequest, auth) => {
    const supabase = createSupabaseRequestClient(request);
    const { error } = await supabase.rpc('delete_user_account');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const adminClient = getSupabaseServerClient();
    const { error: adminError } = await adminClient.auth.admin.deleteUser(auth.userId);

    if (adminError && adminError.message !== 'User not found') {
        return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
});
