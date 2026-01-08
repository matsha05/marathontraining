import { NextRequest, NextResponse } from 'next/server';
import { stravaConfig } from '@/infrastructure/strava/config';
import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import { markStravaWebhookEventProcessed } from '@/infrastructure/strava/store';
import { processStravaWebhookEvent } from '@/infrastructure/strava/processor';
import { parseStravaWebhookPayload } from '@/infrastructure/strava/webhook';
import { stravaProcessQuerySchema } from '@/infrastructure/strava/schemas';

export const runtime = 'nodejs';

const DEFAULT_LIMIT = 25;

export async function POST(request: NextRequest) {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const parsedQuery = stravaProcessQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }
    if (!isAuthorized(request, parsedQuery.data.key)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const limit = parsedQuery.data.limit ?? DEFAULT_LIMIT;
    const { data: events, error } = await supabase
        .from('strava_webhook_events')
        .select('*')
        .eq('status', 'received')
        .order('received_at', { ascending: true })
        .limit(limit);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let processed = 0;
    for (const row of events ?? []) {
        const parsedPayload = parseStravaWebhookPayload(row.payload);
        if (!parsedPayload.success) {
            await markStravaWebhookEventProcessed(
                row.id,
                'ignored',
                `Invalid webhook payload: ${JSON.stringify(parsedPayload.error)}`
            );
            continue;
        }
        const event = parsedPayload.data;

        try {
            const result = await processStravaWebhookEvent(event);
            await markStravaWebhookEventProcessed(row.id, result.status, result.message);
            processed += 1;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Webhook processing error';
            await markStravaWebhookEventProcessed(row.id, 'error', message);
        }
    }

    return NextResponse.json({ ok: true, processed });
}

export async function GET(request: NextRequest) {
    return POST(request);
}

function isAuthorized(request: NextRequest, keyFromQuery?: string) {
    if (process.env.VERCEL === '1' && request.headers.get('x-vercel-cron') === '1') {
        return true;
    }
    const secret = stravaConfig.processingSecret;
    if (!secret) {
        return process.env.NODE_ENV !== 'production';
    }

    const header = request.headers.get('x-strava-processing-secret');
    if (header && header === secret) return true;

    const key = keyFromQuery ?? new URL(request.url).searchParams.get('key');
    return key === secret;
}
