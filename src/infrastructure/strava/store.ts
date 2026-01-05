/**
 * Strava persistence helpers (Supabase)
 */

import { getSupabaseServerClient } from '@/infrastructure/supabase/server';
import type { Database } from '@/infrastructure/supabase/types';

export interface StravaTokenRecord {
    athleteId: string;
    stravaAthleteId: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    scopes?: string[];
}

export async function saveStravaOauthState(state: string, athleteId: string, expiresAt: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('strava_oauth_states')
        .insert({
            state,
            athlete_id: athleteId,
            expires_at: expiresAt,
        });

    if (error) throw error;
}

export async function consumeStravaOauthState(state: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('strava_oauth_states')
        .delete()
        .eq('state', state)
        .select('*')
        .maybeSingle();

    if (error) throw error;
    return data ?? null;
}

export async function upsertStravaTokens(record: StravaTokenRecord) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('strava_tokens')
        .upsert({
            athlete_id: record.athleteId,
            strava_athlete_id: record.stravaAthleteId,
            access_token: record.accessToken,
            refresh_token: record.refreshToken,
            access_token_expires_at: record.accessTokenExpiresAt,
            scopes: record.scopes ?? [],
            updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id' });

    if (error) throw error;
}

export async function getStravaTokensByAthleteId(athleteId: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('strava_tokens')
        .select('*')
        .eq('athlete_id', athleteId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function getStravaTokensByStravaAthleteId(stravaAthleteId: number) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('strava_tokens')
        .select('*')
        .eq('strava_athlete_id', stravaAthleteId)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function deleteStravaTokens(athleteId: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('strava_tokens')
        .delete()
        .eq('athlete_id', athleteId);

    if (error) throw error;
}

export async function insertStravaWebhookEvent(eventType: string, stravaAthleteId: number | null, objectId: number | null, payload: unknown) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('strava_webhook_events')
        .insert({
            event_type: eventType,
            strava_athlete_id: stravaAthleteId,
            object_id: objectId,
            payload: payload as Database['public']['Tables']['strava_webhook_events']['Row']['payload'],
        })
        .select('id')
        .maybeSingle();

    if (error) throw error;
    return data?.id ?? null;
}

export async function markStravaWebhookEventProcessed(id: string, status: string, errorText?: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('strava_webhook_events')
        .update({
            status,
            error: errorText ?? null,
            processed_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Upsert a Strava activity into the activities table (garmin_activities).
 * The table name is a legacy artifact — it stores all activities, with `source` field
 * distinguishing the origin (garmin, strava, manual, etc).
 */
export async function upsertStravaActivity(
    athleteId: string,
    activityId: string,
    summary: Record<string, unknown>,
    rawPayload: Record<string, unknown>
) {
    const supabase = getSupabaseServerClient();
    const startTime = summary.startTime as string | undefined;
    const distanceMeters = summary.distanceMeters as number | undefined;
    const durationSeconds = summary.durationSeconds as number | undefined;
    const avgPace = summary.avgPaceSecPerMile as number | undefined;
    const avgCadence = summary.avgCadence as number | undefined;

    const { error } = await supabase
        .from('garmin_activities')
        .upsert({
            athlete_id: athleteId,
            garmin_user_id: null, // No Garmin user for Strava activities
            garmin_activity_id: activityId, // Store Strava activity ID here
            activity_type: (summary.activityType as string) ?? null,
            start_time: startTime ?? null,
            distance_m: distanceMeters ?? null,
            duration_s: durationSeconds ?? null,
            avg_pace_sec_per_mile: avgPace ?? null,
            cadence_avg: avgCadence ?? null,
            max_hr: (summary.maxHeartRate as number) ?? null,
            avg_hr: (summary.avgHeartRate as number) ?? null,
            fit_summary: rawPayload as Database['public']['Tables']['garmin_activities']['Row']['fit_summary'],
            source: 'strava',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'athlete_id,garmin_activity_id' });

    if (error) throw error;
}

/**
 * Delete a Strava activity by athlete ID and activity ID
 */
export async function deleteStravaActivity(athleteId: string, activityId: string) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase
        .from('garmin_activities')
        .delete()
        .eq('athlete_id', athleteId)
        .eq('garmin_activity_id', activityId)
        .eq('source', 'strava');

    if (error) throw error;
}

/**
 * Get the most recent Strava activity for an athlete
 */
export async function getLatestStravaActivity(athleteId: string) {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
        .from('garmin_activities')
        .select('start_time')
        .eq('athlete_id', athleteId)
        .eq('source', 'strava')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw error;
    return data;
}
