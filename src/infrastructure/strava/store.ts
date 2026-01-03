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
