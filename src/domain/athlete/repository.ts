import { createSupabaseBrowserClient } from '@/infrastructure/supabase';
import type { Database } from '@/infrastructure/supabase/types';

export type AthleteRow = Database['public']['Tables']['athletes']['Row'];
export type AthleteUpdate = Database['public']['Tables']['athletes']['Update'];

export async function fetchAthleteById<T extends Record<string, unknown>>(
    athleteId: string,
    select: string
): Promise<T | null> {
    try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
            .from('athletes')
            .select(select)
            .eq('id', athleteId)
            .maybeSingle();

        if (error) {
            console.warn('[AthleteRepository] Failed to load athlete:', error);
            return null;
        }

        return data as T | null;
    } catch (error) {
        console.warn('[AthleteRepository] Failed to load athlete:', error);
        return null;
    }
}

export async function updateAthleteById(
    athleteId: string,
    updates: AthleteUpdate | Record<string, unknown>
): Promise<boolean> {
    try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase
            .from('athletes')
            .update(updates as Record<string, unknown>)
            .eq('id', athleteId);

        if (error) {
            console.warn('[AthleteRepository] Failed to update athlete:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.warn('[AthleteRepository] Failed to update athlete:', error);
        return false;
    }
}
