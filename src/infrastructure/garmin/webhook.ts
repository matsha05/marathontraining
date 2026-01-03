/**
 * Garmin webhook utilities
 */

import crypto from 'node:crypto';

export interface GarminWebhookEvent {
    type: string;
    garminUserId?: string;
    summaryId?: string;
    activityId?: string;
    activityType?: string;
    fileUrl?: string;
    payload: Record<string, unknown>;
}

export function verifyGarminSignature(rawBody: string, signature: string | null, secret: string): boolean {
    if (!secret) {
        return process.env.NODE_ENV !== 'production';
    }
    if (!signature) return false;

    const normalized = signature.replace(/^sha256=/i, '').trim();
    const digestHex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const digestBase64 = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');

    return timingSafeEqual(normalized, digestHex) || timingSafeEqual(normalized, digestBase64);
}

export function normalizeWebhookPayload(payload: unknown): GarminWebhookEvent[] {
    if (!payload) return [];

    const root = payload as Record<string, unknown>;
    const events = Array.isArray(payload)
        ? payload
        : (Array.isArray(root.events) ? root.events : Array.isArray(root.summaries) ? root.summaries : [payload]);

    return (events as Record<string, unknown>[]).map(event => {
        const garminUserId = pickString(
            event.userId,
            event.garminUserId,
            (event.user as Record<string, unknown> | undefined)?.id,
            root.userId
        );

        return {
            type: pickString(event.eventType, event.type, event.dataType, event.kind) || 'unknown',
            garminUserId: garminUserId || undefined,
            summaryId: pickString(event.summaryId, event.activityId, event.id, event.activitySummaryId) || undefined,
            activityId: pickString(event.activityId, event.id) || undefined,
            activityType: pickString(event.activityType, event.activityTypeId) || undefined,
            fileUrl: pickString(
                event.fileUrl,
                event.fitUrl,
                event.activityFileUrl,
                (event.activityFile as Record<string, unknown> | undefined)?.url,
                (event.activityFile as Record<string, unknown> | undefined)?.downloadUrl,
                event.downloadUrl
            ) || undefined,
            payload: event,
        };
    });
}

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.length > 0) return value;
        if (typeof value === 'number') return String(value);
    }
    return null;
}

function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
