import { NextRequest, NextResponse } from 'next/server';
import { garminConfig } from '@/infrastructure/garmin/config';
import { verifyGarminSignature, normalizeWebhookPayload } from '@/infrastructure/garmin/webhook';
import { insertWebhookEvent, markWebhookEventProcessed } from '@/infrastructure/garmin/store';
import { processGarminWebhookEvent } from '@/infrastructure/garmin/processor';

export const runtime = 'nodejs';
const MAX_WEBHOOK_BYTES = 1024 * 1024;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const challenge = searchParams.get('challenge');

    if (challenge) {
        return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ ok: true });
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

    const signature = request.headers.get('x-garmin-signature')
        || request.headers.get('x-hub-signature-256')
        || request.headers.get('x-signature');

    if (!verifyGarminSignature(rawBody, signature, garminConfig.webhookSecret)) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const events = normalizeWebhookPayload(payload);

    if (events.length === 0) {
        return NextResponse.json({ ok: true, events: 0 });
    }

    const processingMode = garminConfig.processingMode;
    for (const event of events) {
        const eventId = await insertWebhookEvent(event.type, event.garminUserId ?? null, event.payload);

        if (processingMode === 'inline' || processingMode === 'dual') {
            try {
                const result = await processGarminWebhookEvent(event);
                if (eventId) {
                    await markWebhookEventProcessed(eventId, result.status, result.message);
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Webhook processing error';
                if (eventId) {
                    await markWebhookEventProcessed(eventId, 'error', message);
                }
            }
        }
    }

    return NextResponse.json({ ok: true, events: events.length });
}
