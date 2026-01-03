/**
 * Garmin Connect export importer
 */

import crypto from 'node:crypto';
import type { Readable } from 'node:stream';
import yauzl from 'yauzl';
import { parse as parseCsv } from 'csv-parse/sync';
import { parseFitFile } from '@/domain/garmin/fit';
import { calculateReadiness } from '@/domain/garmin/readiness';
import { garminConfig } from './config';
import { insertGarminActivity, upsertHealthMetrics } from './store';
import type { GarminHealthMetrics } from '@/domain/garmin/types';

interface GarminImportResult {
    activitiesImported: number;
    activitiesSkipped: number;
    healthDaysImported: number;
    healthDaysSkipped: number;
    errors: string[];
}

export async function importGarminExportZip(
    athleteId: string,
    buffer: ArrayBuffer | Buffer
): Promise<GarminImportResult> {
    const zipBuffer = buffer instanceof Buffer ? buffer : Buffer.from(buffer);
    const zip = await openZip(zipBuffer);

    const metricsByDate = new Map<string, GarminHealthMetrics>();
    const errors: string[] = [];
    let activitiesImported = 0;
    let activitiesSkipped = 0;

    await new Promise<void>((resolve, reject) => {
        zip.readEntry();
        zip.on('entry', (entry) => {
            processEntry(entry)
                .then(() => zip.readEntry())
                .catch(reject);
        });
        zip.on('end', resolve);
        zip.on('error', reject);
    });

    let healthDaysImported = 0;
    let healthDaysSkipped = 0;
    for (const metrics of metricsByDate.values()) {
        if (!hasAnyHealthMetric(metrics)) {
            healthDaysSkipped += 1;
            continue;
        }
        const readiness = calculateReadiness(metrics);
        await upsertHealthMetrics(
            athleteId,
            null,
            metrics,
            readiness.score,
            readiness.components.reduce<Record<string, unknown>>((acc, component) => {
                acc[component.key] = component;
                return acc;
            }, {}),
            'garmin_export',
            null
        );
        healthDaysImported += 1;
    }

    return {
        activitiesImported,
        activitiesSkipped,
        healthDaysImported,
        healthDaysSkipped,
        errors,
    };

    async function processEntry(entry: yauzl.Entry) {
        if (entry.fileName.endsWith('/')) {
            return;
        }

        const filename = entry.fileName;
        const lower = filename.toLowerCase();

        if (entry.uncompressedSize > garminConfig.maxFitSizeBytes && lower.endsWith('.fit')) {
            activitiesSkipped += 1;
            errors.push(`FIT file too large: ${filename}`);
            return;
        }

        if (lower.endsWith('.fit')) {
            const fileBuffer = await readEntryBuffer(zip, entry);
            if (fileBuffer.byteLength > garminConfig.maxFitSizeBytes) {
                activitiesSkipped += 1;
                errors.push(`FIT file too large: ${filename}`);
                return;
            }

            try {
                const fit = parseFitFile(fileBuffer);
                const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
                const activityId = `export:${hash}`;

                await insertGarminActivity(
                    athleteId,
                    null,
                    activityId,
                    fit.summary.activityType ?? null,
                    { ...fit.summary, source: 'garmin_export' },
                    fit.summary as Record<string, unknown>,
                    fit.laps,
                    fit.records,
                    'garmin_export'
                );
                activitiesImported += 1;
            } catch (error) {
                activitiesSkipped += 1;
                errors.push(`FIT parse failed (${filename}): ${error instanceof Error ? error.message : 'unknown error'}`);
            }
            return;
        }

        if (lower.endsWith('.csv')) {
            const content = await readEntryText(zip, entry);
            try {
                const rows = parseCsv(content, {
                    columns: true,
                    skip_empty_lines: true,
                    relax_column_count: true,
                }) as Record<string, unknown>[];

                for (const row of rows) {
                    const metrics = extractHealthMetricsFromRow(row, filename);
                    if (!metrics) continue;
                    const existing = metricsByDate.get(metrics.summaryDate) ?? { summaryDate: metrics.summaryDate };
                    metricsByDate.set(metrics.summaryDate, mergeHealthMetrics(existing, metrics));
                }
            } catch (error) {
                errors.push(`CSV parse failed (${filename}): ${error instanceof Error ? error.message : 'unknown error'}`);
            }
        }
    }
}

async function openZip(buffer: Buffer): Promise<yauzl.ZipFile> {
    return new Promise((resolve, reject) => {
        yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zipfile) => {
            if (err || !zipfile) {
                reject(err ?? new Error('Unable to open zip'));
                return;
            }
            resolve(zipfile);
        });
    });
}

async function readEntryBuffer(zip: yauzl.ZipFile, entry: yauzl.Entry): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zip.openReadStream(entry, (err, stream) => {
            if (err || !stream) {
                reject(err ?? new Error('Unable to read zip entry'));
                return;
            }
            streamToBuffer(stream)
                .then(resolve)
                .catch(reject);
        });
    });
}

async function readEntryText(zip: yauzl.ZipFile, entry: yauzl.Entry): Promise<string> {
    const buffer = await readEntryBuffer(zip, entry);
    return buffer.toString('utf8');
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

function extractHealthMetricsFromRow(row: Record<string, unknown>, filename: string): GarminHealthMetrics | null {
    const normalizedRow = normalizeRow(row);
    const dateValue = pickValue(normalizedRow, [
        'summarydate',
        'summary_date',
        'date',
        'calendar_date',
        'calendardate',
        'startdate',
        'start_date',
        'starttimelocal',
        'starttime',
    ]);

    const summaryDate = parseDateValue(dateValue?.value)
        ?? parseDateFromFilename(filename);

    if (!summaryDate) return null;

    const sleepScore = parseNumber(pickValue(normalizedRow, ['sleepscore', 'sleep_score', 'score'])?.value);
    const sleepDuration = pickValue(normalizedRow, [
        'sleepduration',
        'sleep_duration',
        'totalsleeptime',
        'total_sleep_time',
        'sleepseconds',
        'sleep_seconds',
        'sleepdurationseconds',
        'sleep_duration_seconds',
        'sleepdurationminutes',
        'sleep_duration_minutes',
        'sleepdurationhours',
        'sleep_duration_hours',
        'duration',
    ]);
    const sleepDurationSec = parseDurationSeconds(sleepDuration?.value, sleepDuration?.key);

    const hrvStatus = parseNumber(pickValue(normalizedRow, [
        'hrvstatus',
        'hrv_status',
        'hrvstatusvalue',
        'hrv_status_value',
        'hrvstatuslevel',
        'hrv_status_level',
    ])?.value);

    const restingHeartRate = parseNumber(pickValue(normalizedRow, [
        'restingheartrate',
        'resting_heart_rate',
        'restinghr',
        'resting_hr',
        'rhr',
    ])?.value);

    const bodyBattery = parseNumber(pickValue(normalizedRow, [
        'bodybattery',
        'body_battery',
        'bodybatteryavg',
        'body_battery_avg',
        'bodybatteryaverage',
        'body_battery_average',
    ])?.value);

    const stressAvg = parseNumber(pickValue(normalizedRow, [
        'stressavg',
        'stress_avg',
        'average_stress',
        'stressaverage',
        'stress_average',
    ])?.value);

    const hasAny = [sleepScore, sleepDurationSec, hrvStatus, restingHeartRate, bodyBattery, stressAvg]
        .some(value => value !== null && value !== undefined);

    if (!hasAny) return null;

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

function normalizeRow(row: Record<string, unknown>): Record<string, { value: unknown; key: string }> {
    const normalized: Record<string, { value: unknown; key: string }> = {};
    for (const [key, value] of Object.entries(row)) {
        const normalizedKey = normalizeHeader(key);
        if (!normalizedKey) continue;
        normalized[normalizedKey] = { value, key: normalizedKey };
    }
    return normalized;
}

function normalizeHeader(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function pickValue(
    normalizedRow: Record<string, { value: unknown; key: string }>,
    aliases: string[]
): { value: unknown; key: string } | null {
    for (const alias of aliases) {
        const normalizedAlias = normalizeHeader(alias);
        const match = normalizedRow[normalizedAlias];
        if (!match) continue;
        if (match.value === null || match.value === undefined) continue;
        if (typeof match.value === 'string' && match.value.trim() === '') continue;
        return match;
    }
    return null;
}

function parseNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
        return Number(value);
    }
    return null;
}

function parseDurationSeconds(value: unknown, key?: string | null): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        if (trimmed.includes(':')) {
            const parts = trimmed.split(':').map(part => Number(part));
            if (parts.some(part => Number.isNaN(part))) return null;
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
            if (parts.length === 2) return parts[0] * 60 + parts[1];
        }
        if (Number.isFinite(Number(trimmed))) {
            return adjustDuration(Number(trimmed), key);
        }
        return null;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
        return adjustDuration(value, key);
    }
    return null;
}

function adjustDuration(value: number, key?: string | null): number {
    const hint = key ?? '';
    if (hint.includes('hour')) return value * 3600;
    if (hint.includes('min')) return value * 60;
    return value;
}

function parseDateValue(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === 'number') {
        const ms = value < 1e12 ? value * 1000 : value;
        const parsed = new Date(ms);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const match = trimmed.match(/\d{4}[-/]\d{2}[-/]\d{2}/);
        if (match) {
            return match[0].replace(/\//g, '-');
        }
        const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (slash) {
            const month = slash[1].padStart(2, '0');
            const day = slash[2].padStart(2, '0');
            return `${slash[3]}-${month}-${day}`;
        }
        const parsed = new Date(trimmed);
        return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    }
    return null;
}

function parseDateFromFilename(filename: string): string | null {
    const match = filename.match(/\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
    const compact = filename.match(/\d{8}/);
    if (!compact) return null;
    const value = compact[0];
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function mergeHealthMetrics(base: GarminHealthMetrics, incoming: GarminHealthMetrics): GarminHealthMetrics {
    return {
        summaryDate: base.summaryDate,
        sleepDurationSec: incoming.sleepDurationSec ?? base.sleepDurationSec,
        sleepScore: incoming.sleepScore ?? base.sleepScore,
        hrvStatus: incoming.hrvStatus ?? base.hrvStatus,
        restingHeartRate: incoming.restingHeartRate ?? base.restingHeartRate,
        bodyBattery: incoming.bodyBattery ?? base.bodyBattery,
        stressAvg: incoming.stressAvg ?? base.stressAvg,
    };
}

function hasAnyHealthMetric(metrics: GarminHealthMetrics): boolean {
    return [
        metrics.sleepDurationSec,
        metrics.sleepScore,
        metrics.hrvStatus,
        metrics.restingHeartRate,
        metrics.bodyBattery,
        metrics.stressAvg,
    ].some(value => value !== undefined && value !== null);
}
