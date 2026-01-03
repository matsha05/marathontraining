import { NextRequest, NextResponse } from 'next/server';
import { stravaConfig } from '@/infrastructure/strava/config';
import { normalizeStravaWebhookPayload } from '@/infrastructure/strava/webhook';
import { insertStravaWebhookEvent, markStravaWebhookEventProcessed } from '@/infrastructure/strava/store';
import { processStravaWebhookEvent } from '@/infrastructure/strava/processor';

export const runtime = 'nodejs';
const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const challenge = searchParams.get('hub.challenge');
    const token = searchParams.get('hub.verify_token');

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

    const event = normalizeStravaWebhookPayload(payload);
    if (!event) {
        return NextResponse.json({ ok: true, ignored: true });
    }

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
