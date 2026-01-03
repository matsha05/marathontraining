/**
 * FIT file parsing and summarization
 */

import { Decoder, Stream } from '@garmin/fitsdk';
import type { FitLapSummary, FitParseResult, GarminActivitySummary } from './types';

const METERS_PER_MILE = 1609.344;

export function parseFitFile(buffer: ArrayBuffer | Buffer): FitParseResult {
    const stream = createStream(buffer);
    const decoder = new Decoder(stream);

    if (!decoder.isFIT()) {
        throw new Error('Not a FIT file');
    }

    const decoderAny = decoder as unknown as { checkIntegrity?: () => boolean };
    if (typeof decoderAny.checkIntegrity === 'function' && !decoderAny.checkIntegrity()) {
        throw new Error('FIT file integrity check failed');
    }

    const { messages, errors } = decoder.read();
    // The SDK uses various property names depending on version and message types
    const msgs = messages as Record<string, Record<string, unknown>[] | undefined>;
    const records = asArray<Record<string, unknown>>(
        msgs.recordMesgs || msgs.recordMesg || msgs.record
    );
    const laps = asArray<Record<string, unknown>>(msgs.lapMesgs || msgs.lapMesg || msgs.lap);
    const sessions = asArray<Record<string, unknown>>(msgs.sessionMesgs || msgs.sessionMesg || msgs.session);
    const session = sessions[0] as Record<string, unknown> | undefined;

    const summary = summarizeFit(session, records, laps);

    return {
        session,
        records,
        laps,
        summary,
        errors: errors?.length ? errors.map(String) : undefined,
    };
}

function createStream(buffer: ArrayBuffer | Buffer): Stream {
    const streamFactory = Stream as unknown as {
        fromArrayBuffer?: (buf: ArrayBuffer) => Stream;
        fromBuffer?: (buf: Buffer) => Stream;
    };

    if (buffer instanceof Buffer && streamFactory.fromBuffer) {
        return streamFactory.fromBuffer(buffer);
    }

    if (streamFactory.fromArrayBuffer && buffer instanceof ArrayBuffer) {
        return streamFactory.fromArrayBuffer(buffer);
    }

    if (streamFactory.fromBuffer) {
        return streamFactory.fromBuffer(Buffer.from(buffer as ArrayBuffer));
    }

    throw new Error('Unsupported FIT stream input');
}

function summarizeFit(
    session: Record<string, unknown> | undefined,
    records: Record<string, unknown>[],
    laps: Record<string, unknown>[]
): GarminActivitySummary {
    const distanceMeters = pickNumber(session?.totalDistance) ?? getRecordNumber(records, 'distance');
    const durationSeconds = pickNumber(session?.totalTimerTime)
        ?? pickNumber(session?.totalElapsedTime)
        ?? computeDurationSeconds(records);

    const avgSpeedMetersPerSecond = pickNumber(session?.avgSpeed)
        ?? (distanceMeters && durationSeconds ? distanceMeters / durationSeconds : null);

    const avgPaceSecPerMile = avgSpeedMetersPerSecond != null
        ? paceFromSpeed(avgSpeedMetersPerSecond)
        : (distanceMeters && durationSeconds ? paceFromDistance(distanceMeters, durationSeconds) : undefined);

    const avgHeartRate = pickNumber(session?.avgHeartRate) ?? averageFromRecords(records, 'heartRate');
    const maxHeartRate = pickNumber(session?.maxHeartRate) ?? maxFromRecords(records, 'heartRate');
    const avgCadence = pickNumber(session?.avgCadence) ?? averageFromRecords(records, 'cadence');

    const startTime = normalizeTimestamp(session?.startTime)
        ?? normalizeTimestamp(records[0]?.timestamp);

    return {
        startTime: startTime?.toISOString(),
        durationSeconds: durationSeconds ?? undefined,
        distanceMeters: distanceMeters ?? undefined,
        avgSpeedMetersPerSecond: avgSpeedMetersPerSecond ?? undefined,
        avgPaceSecPerMile: avgPaceSecPerMile ?? undefined,
        avgHeartRate: avgHeartRate ?? undefined,
        maxHeartRate: maxHeartRate ?? undefined,
        avgCadence: avgCadence ?? undefined,
        activityType: pickString(session?.sport, session?.sportProfileName, session?.subSport) ?? undefined,
        laps: summarizeLaps(laps),
    };
}

function summarizeLaps(laps: Record<string, unknown>[]): FitLapSummary[] {
    return laps.map((lap, index) => {
        const distanceMeters = pickNumber(lap.totalDistance);
        const durationSeconds = pickNumber(lap.totalTimerTime)
            ?? pickNumber(lap.totalElapsedTime);
        const avgSpeed = pickNumber(lap.avgSpeed);
        const avgPace = avgSpeed !== null ? paceFromSpeed(avgSpeed) : (distanceMeters && durationSeconds ? paceFromDistance(distanceMeters, durationSeconds) : undefined);

        return {
            lapNumber: index + 1,
            distanceMeters: distanceMeters ?? undefined,
            durationSeconds: durationSeconds ?? undefined,
            avgPaceSecPerMile: avgPace ?? undefined,
            avgHeartRate: pickNumber(lap.avgHeartRate) ?? undefined,
            maxHeartRate: pickNumber(lap.maxHeartRate) ?? undefined,
        };
    });
}

function asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function pickNumber(value: unknown): number | null {
    if (typeof value !== 'number' || Number.isNaN(value)) return null;
    return value;
}

function normalizeTimestamp(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    if (typeof value === 'number') {
        const ms = value < 1e12 ? value * 1000 : value;
        const date = new Date(ms);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    return null;
}

function computeDurationSeconds(records: Record<string, unknown>[]): number | null {
    if (records.length < 2) return null;
    const start = normalizeTimestamp(records[0]?.timestamp);
    const end = normalizeTimestamp(records[records.length - 1]?.timestamp);
    if (!start || !end) return null;
    const delta = (end.getTime() - start.getTime()) / 1000;
    return delta > 0 ? delta : null;
}

function averageFromRecords(records: Record<string, unknown>[], key: string): number | null {
    const values = records
        .map(record => record[key])
        .filter(value => typeof value === 'number') as number[];

    if (values.length === 0) return null;
    const sum = values.reduce((acc, value) => acc + value, 0);
    return sum / values.length;
}

function maxFromRecords(records: Record<string, unknown>[], key: string): number | null {
    const values = records
        .map(record => record[key])
        .filter(value => typeof value === 'number') as number[];

    if (values.length === 0) return null;
    return Math.max(...values);
}

function getRecordNumber(records: Record<string, unknown>[], key: string): number | null {
    if (records.length === 0) return null;
    const last = records[records.length - 1]?.[key];
    return pickNumber(last);
}

function paceFromSpeed(speedMetersPerSecond: number): number | undefined {
    if (!Number.isFinite(speedMetersPerSecond) || speedMetersPerSecond <= 0) return undefined;
    const secondsPerMeter = 1 / speedMetersPerSecond;
    return secondsPerMeter * METERS_PER_MILE;
}

function paceFromDistance(distanceMeters: number, durationSeconds: number): number | undefined {
    if (!distanceMeters || !durationSeconds) return undefined;
    return (durationSeconds / distanceMeters) * METERS_PER_MILE;
}

function pickString(...values: unknown[]): string | null {
    for (const value of values) {
        if (typeof value === 'string' && value.trim() !== '') return value;
        if (typeof value === 'number') return String(value);
    }
    return null;
}
