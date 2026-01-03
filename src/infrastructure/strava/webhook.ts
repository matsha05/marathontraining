/**
 * Strava webhook utilities
 */

export interface StravaWebhookEvent {
    objectType: string;
    aspectType: string;
    objectId: number;
    ownerId: number;
    eventTime?: number;
    payload: Record<string, unknown>;
}

export function normalizeStravaWebhookPayload(payload: unknown): StravaWebhookEvent | null {
    if (!payload || typeof payload !== 'object') return null;

    const event = payload as Record<string, unknown>;
    const objectType = asString(event.object_type);
    const aspectType = asString(event.aspect_type);
    const objectId = asNumber(event.object_id);
    const ownerId = asNumber(event.owner_id);

    if (!objectType || !aspectType || objectId === null || ownerId === null) return null;

    return {
        objectType,
        aspectType,
        objectId,
        ownerId,
        eventTime: asNumber(event.event_time) ?? undefined,
        payload: event,
    };
}

function asString(value: unknown): string | null {
    if (typeof value === 'string' && value.trim() !== '') return value;
    return null;
}

function asNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
        return Number(value);
    }
    return null;
}
