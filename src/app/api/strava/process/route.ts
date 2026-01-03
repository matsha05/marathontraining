import { NextRequest, NextResponse } from 'next/server';
import { stravaConfig } from '@/infrastructure/strava/config';
import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import { markStravaWebhookEventProcessed } from '@/infrastructure/strava/store';
import { processStravaWebhookEvent } from '@/infrastructure/strava/processor';
import { normalizeStravaWebhookPayload } from '@/infrastructure/strava/webhook';

export const runtime = 'nodejs';

const DEFAULT_LIMIT = 25;

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : DEFAULT_LIMIT;
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
        if (!row.payload || typeof row.payload !== 'object') {
            await markStravaWebhookEventProcessed(row.id, 'ignored', 'Invalid webhook payload');
            continue;
        }

        const event = normalizeStravaWebhookPayload(row.payload as Record<string, unknown>);
        if (!event) {
            await markStravaWebhookEventProcessed(row.id, 'ignored', 'Unable to parse webhook payload');
            continue;
        }

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

function isAuthorized(request: NextRequest) {
    const secret = stravaConfig.processingSecret;
    if (!secret) {
        return process.env.NODE_ENV !== 'production';
    }

    const header = request.headers.get('x-strava-processing-secret');
    if (header && header === secret) return true;

    const { searchParams } = new URL(request.url);
    return searchParams.get('key') === secret;
}
