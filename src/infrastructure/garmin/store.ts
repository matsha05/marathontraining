/**
 * Garmin persistence helpers (Supabase)
 */

import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import type { GarminHealthMetrics, GarminActivitySummary } from '@/domain/garmin/types';
import type { Database } from '@/infrastructure/supabase/types';

export interface GarminTokenRecord {
    athleteId: string;
    garminUserId: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt?: string | null;
    tokenType?: string;
    scopes?: string[];
}

export async function saveOauthState(state: string, athleteId: string, codeVerifier: string, expiresAt: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_oauth_states')
        .insert({
            state,
            athlete_id: athleteId,
            code_verifier: codeVerifier,
            expires_at: expiresAt,
        });

    if (error) throw error;
}

export async function consumeOauthState(state: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('garmin_oauth_states')
        .delete()
        .eq('state', state)
        .select('*')
        .maybeSingle();

    if (error) throw error;
    return data ?? null;
}

export async function upsertGarminTokens(record: GarminTokenRecord) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_tokens')
        .upsert({
            athlete_id: record.athleteId,
            garmin_user_id: record.garminUserId,
            access_token: record.accessToken,
            refresh_token: record.refreshToken,
            access_token_expires_at: record.accessTokenExpiresAt,
            refresh_token_expires_at: record.refreshTokenExpiresAt ?? null,
            token_type: record.tokenType ?? 'bearer',
            scopes: record.scopes ?? [],
            updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id' });

    if (error) throw error;
}

export async function getGarminTokensByAthleteId(athleteId: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('garmin_tokens')
        .select('*')
        .eq('athlete_id', athleteId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getGarminTokensByGarminUserId(garminUserId: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('garmin_tokens')
        .select('*')
        .eq('garmin_user_id', garminUserId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function deleteGarminTokens(athleteId: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_tokens')
        .delete()
        .eq('athlete_id', athleteId);

    if (error) throw error;
}

export async function insertWebhookEvent(eventType: string, garminUserId: string | null, payload: unknown) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('garmin_webhook_events')
        .insert({
            event_type: eventType,
            garmin_user_id: garminUserId,
            payload: payload as Database['public']['Tables']['garmin_webhook_events']['Row']['payload'],
        })
        .select('id')
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
}

export async function markWebhookEventProcessed(id: string, status: string, errorText?: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_webhook_events')
        .update({
            status,
            error: errorText ?? null,
            processed_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) throw error;
}

export async function upsertHealthMetrics(
    athleteId: string | null,
    garminUserId: string | null,
    metrics: GarminHealthMetrics,
    readinessScore: number | null,
    readinessComponents: Record<string, unknown> | null,
    source: string,
    rawPayload: Record<string, unknown> | null
) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_health_metrics')
        .upsert({
            athlete_id: athleteId,
            garmin_user_id: garminUserId,
            summary_date: metrics.summaryDate,
            sleep_duration_seconds: metrics.sleepDurationSec ?? null,
            sleep_score: metrics.sleepScore ?? null,
            hrv_status: metrics.hrvStatus ?? null,
            resting_heart_rate: metrics.restingHeartRate ?? null,
            body_battery: metrics.bodyBattery ?? null,
            stress_avg: metrics.stressAvg ?? null,
            readiness_score: readinessScore ?? null,
            readiness_components: readinessComponents,
            source,
            raw_payload: rawPayload,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id,summary_date' });

    if (error) throw error;
}

export async function insertGarminActivity(
    athleteId: string | null,
    garminUserId: string | null,
    activityId: string | null,
    activityType: string | null,
    summary: GarminActivitySummary,
    fitSummary: Record<string, unknown> | null,
    fitLaps: Record<string, unknown>[] | null,
    fitRecords: Record<string, unknown>[] | null,
    source: string
) {
    const supabase = getSupabaseServerClient();
    if (!activityId) {
        return;
    }
    const { error } = await supabase
        .from('garmin_activities')
        .upsert({
            athlete_id: athleteId,
            garmin_user_id: garminUserId,
            garmin_activity_id: activityId,
            start_time: summary.startTime ?? null,
            activity_type: activityType ?? summary.activityType ?? null,
            distance_m: summary.distanceMeters ?? null,
            duration_s: summary.durationSeconds ?? null,
            avg_pace_sec_per_mile: summary.avgPaceSecPerMile ?? null,
            avg_hr: summary.avgHeartRate ?? null,
            max_hr: summary.maxHeartRate ?? null,
            cadence_avg: summary.avgCadence ?? null,
            fit_summary: fitSummary,
            fit_laps: fitLaps,
            fit_records: fitRecords,
            source,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id,source,garmin_activity_id' });

    if (error) throw error;
}

export async function deleteGarminActivityBySourceId(athleteId: string, source: string, activityId: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_activities')
        .delete()
        .eq('athlete_id', athleteId)
        .eq('source', source)
        .eq('garmin_activity_id', activityId);

    if (error) throw error;
}
