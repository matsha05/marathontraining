/**
 * Strava webhook processing pipeline
 * 
 * Simplified version - activities logged directly to completed_workouts
 */

import { fetchStravaActivity } from './api';
import { getValidAccessToken } from './token';
import { getStravaTokensByStravaAthleteId, upsertStravaActivity, deleteStravaActivity } from './store';
import type { StravaWebhookEvent } from './webhook';

const METERS_PER_MILE = 1609.344;

export interface ProcessResult {
    status: 'processed' | 'ignored';
    message?: string;
}

export interface StravaActivitySummary {
    startTime?: string;
    distanceMeters?: number;
    durationSeconds?: number;
    avgSpeedMetersPerSecond?: number;
    avgPaceSecPerMile?: number;
    avgHeartRate?: number;
    maxHeartRate?: number;
    avgCadence?: number;
    activityType?: string;
}

export async function processStravaWebhookEvent(event: StravaWebhookEvent): Promise<ProcessResult> {
    if (event.objectType !== 'activity') {
        return { status: 'ignored', message: 'Non-activity event' };
    }

    const tokenRow = await getStravaTokensByStravaAthleteId(event.ownerId);
    if (!tokenRow) {
        return { status: 'ignored', message: 'No linked athlete for Strava user' };
    }

    if (event.aspectType === 'delete') {
        await deleteStravaActivity(tokenRow.athlete_id, `strava:${event.objectId}`);
        return { status: 'processed' };
    }

    const accessToken = await getValidAccessToken(tokenRow, () => getStravaTokensByStravaAthleteId(event.ownerId));
    const activity = await fetchStravaActivity(event.objectId, accessToken);
    const summary = mapStravaActivity(activity);

    await upsertStravaActivity(tokenRow.athlete_id, `strava:${event.objectId}`, summary as Record<string, unknown>, activity);

    return { status: 'processed' };
}

export function mapStravaActivity(activity: Record<string, unknown>): StravaActivitySummary {
    const distanceMeters = asNumber(activity.distance);
    const durationSeconds = asNumber(activity.moving_time) ?? asNumber(activity.elapsed_time);
    const avgSpeed = asNumber(activity.average_speed);
    const avgPaceSecPerMile = avgSpeed ? (1 / avgSpeed) * METERS_PER_MILE : undefined;

    return {
        startTime: asString(activity.start_date) ?? asString(activity.start_date_local) ?? undefined,
        distanceMeters: distanceMeters ?? undefined,
        durationSeconds: durationSeconds ?? undefined,
        avgSpeedMetersPerSecond: avgSpeed ?? undefined,
        avgPaceSecPerMile,
        avgHeartRate: asNumber(activity.average_heartrate) ?? undefined,
        maxHeartRate: asNumber(activity.max_heartrate) ?? undefined,
        avgCadence: asNumber(activity.average_cadence) ?? undefined,
        activityType: asString(activity.type) ?? undefined,
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
