/**
 * Garmin webhook processing pipeline
 */

import { garminConfig } from './config';
import crypto from 'node:crypto';
import { calculateReadiness } from '@/domain/garmin/readiness';
import { parseFitFile } from '@/domain/garmin/fit';
import { fetchGarminResource } from './api';
import { getValidAccessToken } from './token';
import { getGarminTokensByGarminUserId, insertGarminActivity, upsertHealthMetrics } from './store';
import { logCompletedWorkoutFromActivity } from './activity-log';
import { normalizeWebhookPayload } from './webhook';
import type { GarminWebhookEvent } from './webhook';
import type { GarminActivitySummary, GarminHealthMetrics } from '@/domain/garmin/types';

export interface ProcessResult {
    status: 'processed' | 'ignored';
    message?: string;
}

export function buildWebhookEvent(payload: Record<string, unknown>, storedUserId?: string | null, eventType?: string): GarminWebhookEvent | null {
    const [event] = normalizeWebhookPayload(payload);
    if (!event) return null;

    return {
        ...event,
        garminUserId: event.garminUserId ?? storedUserId ?? undefined,
        type: eventType || event.type,
    };
}

export async function processGarminWebhookEvent(event: GarminWebhookEvent): Promise<ProcessResult> {
    const garminUserId = event.garminUserId;
    const tokenRow = garminUserId ? await getGarminTokensByGarminUserId(garminUserId) : null;

    if (!tokenRow) {
        return {
            status: 'ignored',
            message: garminUserId ? 'No linked athlete for Garmin user' : 'Missing Garmin user id',
        };
    }

    const healthMetrics = extractHealthMetrics(event.payload);
    if (healthMetrics) {
        const readiness = calculateReadiness(healthMetrics);
        await upsertHealthMetrics(
            tokenRow?.athlete_id ?? null,
            garminUserId ?? null,
            healthMetrics,
            readiness.score,
            readiness.components.reduce<Record<string, unknown>>((acc, component) => {
                acc[component.key] = component;
                return acc;
            }, {}),
            'webhook',
            event.payload
        );
    }

    const activitySummary = extractActivitySummary(event.payload);
    const fileUrl = event.fileUrl || resolveTemplateUrl(garminConfig.activityDetailUrlTemplate, event);

    if (fileUrl && tokenRow) {
        assertAllowedDownloadUrl(fileUrl);
        const accessToken = await getValidAccessToken(tokenRow, () => getGarminTokensByGarminUserId(tokenRow.garmin_user_id));
        const fitBuffer = await fetchGarminResource(fileUrl, accessToken);
        const fit = parseFitFile(fitBuffer);
        const fallbackId = crypto.createHash('sha256').update(Buffer.from(fitBuffer)).digest('hex');
        const activityId = event.summaryId ?? event.activityId ?? `fit:${fallbackId}`;

        await insertGarminActivity(
            tokenRow.athlete_id,
            garminUserId ?? null,
            activityId,
            event.activityType ?? activitySummary?.activityType ?? null,
            { ...fit.summary, source: 'garmin' },
            fit.summary as Record<string, unknown>,
            fit.laps,
            fit.records,
            'garmin'
        );
        await logCompletedWorkoutFromActivity(tokenRow.athlete_id, fit.summary, { allowUnmatched: false });

        return { status: 'processed' };
    }

    if (activitySummary) {
        const activityId = event.summaryId ?? event.activityId ?? null;
        await insertGarminActivity(
            tokenRow?.athlete_id ?? null,
            garminUserId ?? null,
            activityId,
            event.activityType ?? activitySummary.activityType ?? null,
            { ...activitySummary, source: 'garmin' },
            activitySummary as Record<string, unknown>,
            null,
            null,
            'garmin'
        );
        if (tokenRow?.athlete_id) {
            await logCompletedWorkoutFromActivity(tokenRow.athlete_id, activitySummary, { allowUnmatched: false });
        }

        return { status: 'processed' };
    }

    if (!healthMetrics) {
        return { status: 'ignored', message: 'No actionable health or activity data' };
    }

    return { status: 'processed' };
}

export function assertAllowedDownloadUrl(url: string) {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
        throw new Error('Invalid Garmin download URL protocol');
    }

    const allowed = garminConfig.allowedDownloadHosts;
    if (!isHostAllowed(parsed.hostname, allowed)) {
        throw new Error(`Untrusted Garmin download host: ${parsed.hostname}`);
    }
}

function isHostAllowed(hostname: string, allowedHosts: string[]): boolean {
    for (const host of allowedHosts) {
        if (host.startsWith('*.')) {
            const suffix = host.slice(1);
            if (hostname.endsWith(suffix)) return true;
        } else if (hostname === host) {
            return true;
        }
    }
    return false;
}

function extractHealthMetrics(payload: Record<string, unknown>): GarminHealthMetrics | null {
    const summaryDate = pickDateString(
        payload.summaryDate,
        payload.calendarDate,
        payload.date,
        payload.startTimeLocal,
        payload.startTime,
        payload.startTimeInSeconds
    );

    const sleepScore = pickNumber(payload.sleepScore, (payload.sleep as Record<string, unknown> | undefined)?.score);
    const sleepDurationSec = pickNumber(
        payload.sleepDuration,
        payload.sleepDurationInSeconds,
        payload.sleepSeconds,
        (payload.sleep as Record<string, unknown> | undefined)?.duration
    );
    const hrvStatus = pickNumber(payload.hrvStatus, payload.hrvStatusValue, payload.hrvStatusLevel);
    const restingHeartRate = pickNumber(payload.restingHeartRate, payload.restingHeartRateInBpm);
    const bodyBattery = pickNumber(payload.bodyBattery, payload.bodyBatteryAverage, payload.bodyBatteryHigh);
    const stressAvg = pickNumber(payload.stressAvg, payload.stressAverage, payload.averageStressLevel);

    const hasAny = [sleepScore, sleepDurationSec, hrvStatus, restingHeartRate, bodyBattery, stressAvg]
        .some(value => value !== null);

    if (!summaryDate || !hasAny) return null;

    return {
        summaryDate,
        sleepDurationSec: sleepDurationSec ?? undefined,
        sleepScore: sleepScore ?? undefined,
        hrvStatus: hrvStatus ?? undefined,
        restingHeartRate: restingHeartRate ?? undefined,
        bodyBattery: bodyBattery ?? undefined,
        stressAvg: stressAvg ?? undefined,
    };
}

function extractActivitySummary(payload: Record<string, unknown>): GarminActivitySummary | null {
    const distanceMeters = pickNumber(payload.distanceInMeters, payload.totalDistance, payload.distance);
    const durationSeconds = pickNumber(payload.durationInSeconds, payload.totalDuration, payload.totalTimerTime, payload.elapsedDuration);
    const avgPace = pickNumber(payload.averagePace, payload.avgPaceSecPerMile);
    const avgHeartRate = pickNumber(payload.averageHeartRate, payload.avgHeartRate);

    if (!distanceMeters && !durationSeconds && !avgPace && !avgHeartRate) return null;

    return {
        startTime: pickDateTimeString(
            payload.startTime,
            payload.startTimeGMT,
            payload.startTimeInSeconds,
            payload.startTimeLocal,
            payload.startTimeLocalInSeconds
        ) ?? undefined,
        distanceMeters: distanceMeters ?? undefined,
        durationSeconds: durationSeconds ?? undefined,
        avgPaceSecPerMile: avgPace ?? undefined,
        avgHeartRate: avgHeartRate ?? undefined,
        activityType: pickString(payload.activityType, payload.sport, payload.activityName) ?? undefined,
    };
}

function pickNumber(...values: unknown[]): number | null {
    for (const value of values) {
        if (typeof value === 'number' && !Number.isNaN(value)) return value;
        if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
            return Number(value);
        }
    }
    return null;
}

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim() !== '') return value;
        if (typeof value === 'number') return String(value);
    }
    return null;
}

function pickDateString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string') {
            const match = value.match(/^\d{4}-\d{2}-\d{2}/);
            if (match) return match[0];
            const parsed = new Date(value);
            if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
        }
        if (typeof value === 'number') {
            const ms = value < 1e12 ? value * 1000 : value;
            const parsed = new Date(ms);
            if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
        }
    }
    return null;
}

function pickDateTimeString(...values: unknown[]): string | null {
    for (const value of values) {
        if (!value) continue;
        if (value instanceof Date) {
            return value.toISOString();
        }
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) continue;
            const parsed = new Date(trimmed);
            if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
        }
        if (typeof value === 'number') {
            const ms = value < 1e12 ? value * 1000 : value;
            const parsed = new Date(ms);
            if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
        }
    }
    return null;
}

function resolveTemplateUrl(template: string, event: { summaryId?: string; activityId?: string; garminUserId?: string }) {
    if (!template) return null;
    const id = event.summaryId || event.activityId;
    if (!id) return null;

    return template
        .replace('{summaryId}', id)
        .replace('{activityId}', id)
        .replace('{userId}', event.garminUserId || '');
}
