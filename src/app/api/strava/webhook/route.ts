import { NextRequest, NextResponse } from 'next/server';
import { stravaConfig } from '@/infrastructure/strava/config';
import { parseStravaWebhookPayload } from '@/infrastructure/strava/webhook';
import { stravaWebhookQuerySchema } from '@/infrastructure/strava/schemas';
import { insertStravaWebhookEvent, markStravaWebhookEventProcessed } from '@/infrastructure/strava/store';
import { processStravaWebhookEvent } from '@/infrastructure/strava/processor';

export const runtime = 'nodejs';
const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const parsedQuery = stravaWebhookQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsedQuery.success) {
        return NextResponse.json(
            { error: 'Invalid query', details: parsedQuery.error.flatten() },
            { status: 400 }
        );
    }

    const mode = parsedQuery.data['hub.mode'];
    const challenge = parsedQuery.data['hub.challenge'];
    const token = parsedQuery.data['hub.verify_token'];

    if (mode !== 'subscribe' || !challenge) {
        return NextResponse.json({ ok: true });
    }

    if (stravaConfig.webhookVerifyToken) {
        if (token !== stravaConfig.webhookVerifyToken) {
            return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
        }
    } else if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Missing STRAVA_WEBHOOK_VERIFY_TOKEN' }, { status: 403 });
    }

    return NextResponse.json({ 'hub.challenge': challenge });
}

export async function POST(request: NextRequest) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_WEBHOOK_BYTES) {
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_WEBHOOK_BYTES) {
        return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsedPayload = parseStravaWebhookPayload(payload);
    if (!parsedPayload.success) {
        return NextResponse.json(
            { error: 'Invalid webhook payload', details: parsedPayload.error },
            { status: 400 }
        );
    }

    const event = parsedPayload.data;
    const eventId = await insertStravaWebhookEvent(event.aspectType, event.ownerId, event.objectId, event.payload);

    if (stravaConfig.processingMode === 'inline' || stravaConfig.processingMode === 'dual') {
        try {
            const result = await processStravaWebhookEvent(event);
            if (eventId) {
                await markStravaWebhookEventProcessed(eventId, result.status, result.message);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Webhook processing error';
            if (eventId) {
                await markStravaWebhookEventProcessed(eventId, 'error', message);
            }
        }
    }

    return NextResponse.json({ ok: true });
}
