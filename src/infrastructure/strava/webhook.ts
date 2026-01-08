/**
 * Strava webhook utilities
 */

import { stravaWebhookPayloadSchema } from './schemas';

export interface StravaWebhookEvent {
    objectType: string;
    aspectType: string;
    objectId: number;
    ownerId: number;
    eventTime?: number;
    payload: Record<string, unknown>;
}

export function parseStravaWebhookPayload(payload: unknown): { success: true; data: StravaWebhookEvent } | { success: false; error: Record<string, unknown> } {
    const parsed = stravaWebhookPayloadSchema.safeParse(payload);
    if (!parsed.success) {
        return { success: false, error: parsed.error.flatten() };
    }

    return {
        success: true,
        data: {
            objectType: parsed.data.object_type,
            aspectType: parsed.data.aspect_type,
            objectId: parsed.data.object_id,
            ownerId: parsed.data.owner_id,
            eventTime: parsed.data.event_time ?? undefined,
            payload: parsed.data as Record<string, unknown>,
        },
    };
}

export function normalizeStravaWebhookPayload(payload: unknown): StravaWebhookEvent | null {
    const parsed = parseStravaWebhookPayload(payload);
    return parsed.success ? parsed.data : null;
}
