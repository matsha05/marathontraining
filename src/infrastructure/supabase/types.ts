/**
 * Database Types (Generated from Supabase schema)
 * 
 * TODO: Replace with actual generated types from Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > src/infrastructure/supabase/types.ts
 */

export interface Database {
    public: {
        Tables: {
            athletes: {
                Row: {
                    id: string;
                    name: string;
                    weight_kg: number | null;
                    age: number | null;
                    sex: 'male' | 'female' | null;
                    running_experience_months: number;
                    strength_background: 'none' | 'recreational' | 'intermediate' | 'advanced';
                    equipment: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['athletes']['Row'], 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['athletes']['Insert']>;
            };

            vdot_history: {
                Row: {
                    id: string;
                    athlete_id: string;
                    vdot: number;
                    source: 'race' | 'time_trial' | 'manual';
                    race_distance_m: number | null;
                    race_time_seconds: number | null;
                    calculated_at: string;
                    is_current: boolean;
                };
                Insert: Omit<Database['public']['Tables']['vdot_history']['Row'], 'id' | 'calculated_at'>;
                Update: Partial<Database['public']['Tables']['vdot_history']['Insert']>;
            };

            goal_races: {
                Row: {
                    id: string;
                    athlete_id: string;
                    distance: '5k' | '10k' | 'half' | 'marathon' | 'ultra_50k' | 'ultra_50m' | 'ultra_100k' | 'ultra_100m';
                    race_date: string;
                    terrain: 'road' | 'trail' | 'mountain';
                    race_name: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['goal_races']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['goal_races']['Insert']>;
            };

            training_plans: {
                Row: {
                    id: string;
                    athlete_id: string;
                    goal_race_id: string | null;
                    start_date: string;
                    end_date: string;
                    plan_type: 'build' | 'peak' | 'taper' | 'recovery';
                    vdot_at_creation: number;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['training_plans']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['training_plans']['Insert']>;
            };

            planned_workouts: {
                Row: {
                    id: string;
                    plan_id: string;
                    athlete_id: string;
                    scheduled_date: string;
                    day_of_week: number;
                    session_type: string;
                    prescription: Record<string, unknown>;
                    durability_modules: string[] | null;
                    fueling_plan: Record<string, unknown> | null;
                    status: 'scheduled' | 'completed' | 'skipped' | 'modified';
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['planned_workouts']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['planned_workouts']['Insert']>;
            };

            completed_workouts: {
                Row: {
                    id: string;
                    planned_workout_id: string | null;
                    athlete_id: string;
                    completed_date: string;
                    actual_session: Record<string, unknown>;
                    zone_minutes: Record<string, unknown> | null;
                    symptoms: Record<string, unknown> | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['completed_workouts']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['completed_workouts']['Insert']>;
            };

            symptom_logs: {
                Row: {
                    id: string;
                    athlete_id: string;
                    logged_date: string;
                    morning_pain: number | null;
                    morning_stiffness_minutes: number | null;
                    post_activity_pain: number | null;
                    pain_site: string | null;
                    swelling: boolean;
                    numbness: boolean;
                    gait_change: boolean;
                    bony_tenderness: boolean;
                    injury_status: 'green' | 'amber' | 'red' | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['symptom_logs']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['symptom_logs']['Insert']>;
            };

            durability_assessments: {
                Row: {
                    id: string;
                    athlete_id: string;
                    assessed_date: string;
                    results: Record<string, unknown>;
                    assigned_modules: string[];
                    created_at: string;
                };
                Insert: Omit<Database['public']['Tables']['durability_assessments']['Row'], 'id' | 'created_at'>;
                Update: Partial<Database['public']['Tables']['durability_assessments']['Insert']>;
            };

            garmin_oauth_states: {
                Row: {
                    state: string;
                    athlete_id: string;
                    code_verifier: string;
                    created_at: string;
                    expires_at: string;
                };
                Insert: Omit<Database['public']['Tables']['garmin_oauth_states']['Row'], 'created_at'>;
                Update: Partial<Database['public']['Tables']['garmin_oauth_states']['Insert']>;
            };

            garmin_tokens: {
                Row: {
                    id: string;
                    athlete_id: string;
                    garmin_user_id: string;
                    access_token: string;
                    refresh_token: string;
                    access_token_expires_at: string;
                    refresh_token_expires_at: string | null;
                    token_type: string;
                    scopes: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['garmin_tokens']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['garmin_tokens']['Insert']>;
            };

            garmin_webhook_events: {
                Row: {
                    id: string;
                    garmin_user_id: string | null;
                    event_type: string;
                    payload: Record<string, unknown>;
                    received_at: string;
                    processed_at: string | null;
                    status: string;
                    error: string | null;
                };
                Insert: Omit<Database['public']['Tables']['garmin_webhook_events']['Row'], 'id' | 'received_at'>;
                Update: Partial<Database['public']['Tables']['garmin_webhook_events']['Insert']>;
            };

            garmin_health_metrics: {
                Row: {
                    id: string;
                    athlete_id: string | null;
                    garmin_user_id: string | null;
                    summary_date: string;
                    sleep_duration_seconds: number | null;
                    sleep_score: number | null;
                    hrv_status: number | null;
                    resting_heart_rate: number | null;
                    body_battery: number | null;
                    stress_avg: number | null;
                    readiness_score: number | null;
                    readiness_components: Record<string, unknown> | null;
                    source: string | null;
                    raw_payload: Record<string, unknown> | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['garmin_health_metrics']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['garmin_health_metrics']['Insert']>;
            };

            garmin_activities: {
                Row: {
                    id: string;
                    athlete_id: string | null;
                    garmin_user_id: string | null;
                    garmin_activity_id: string | null;
                    start_time: string | null;
                    activity_type: string | null;
                    distance_m: number | null;
                    duration_s: number | null;
                    avg_pace_sec_per_mile: number | null;
                    avg_hr: number | null;
                    max_hr: number | null;
                    cadence_avg: number | null;
                    device_name: string | null;
                    fit_summary: Record<string, unknown> | null;
                    fit_laps: Record<string, unknown>[] | null;
                    fit_records: Record<string, unknown>[] | null;
                    source: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['garmin_activities']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['garmin_activities']['Insert']>;
            };

            strava_oauth_states: {
                Row: {
                    state: string;
                    athlete_id: string;
                    created_at: string;
                    expires_at: string;
                };
                Insert: Omit<Database['public']['Tables']['strava_oauth_states']['Row'], 'created_at'>;
                Update: Partial<Database['public']['Tables']['strava_oauth_states']['Insert']>;
            };

            strava_tokens: {
                Row: {
                    id: string;
                    athlete_id: string;
                    strava_athlete_id: number;
                    access_token: string;
                    refresh_token: string;
                    access_token_expires_at: string;
                    scopes: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: Omit<Database['public']['Tables']['strava_tokens']['Row'], 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Database['public']['Tables']['strava_tokens']['Insert']>;
            };

            strava_webhook_events: {
                Row: {
                    id: string;
                    strava_athlete_id: number | null;
                    object_id: number | null;
                    event_type: string;
                    payload: Record<string, unknown>;
                    received_at: string;
                    processed_at: string | null;
                    status: string;
                    error: string | null;
                };
                Insert: Omit<Database['public']['Tables']['strava_webhook_events']['Row'], 'id' | 'received_at'>;
                Update: Partial<Database['public']['Tables']['strava_webhook_events']['Insert']>;
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
    };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
