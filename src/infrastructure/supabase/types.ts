export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      athletes: {
        Row: {
          age: number | null
          created_at: string
          equipment: string[]
          id: string
          name: string
          notify_training_reminders: boolean | null
          notify_weekly_summary: boolean | null
          running_experience_months: number
          sex: string | null
          strength_background: string
          units: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          equipment?: string[]
          id?: string
          name: string
          notify_training_reminders?: boolean | null
          notify_weekly_summary?: boolean | null
          running_experience_months?: number
          sex?: string | null
          strength_background?: string
          units?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          equipment?: string[]
          id?: string
          name?: string
          notify_training_reminders?: boolean | null
          notify_weekly_summary?: boolean | null
          running_experience_months?: number
          sex?: string | null
          strength_background?: string
          units?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      completed_workouts: {
        Row: {
          actual_session: Json
          athlete_id: string
          completed_date: string
          created_at: string
          id: string
          planned_workout_id: string | null
          symptoms: Json | null
          zone_minutes: Json | null
        }
        Insert: {
          actual_session: Json
          athlete_id: string
          completed_date: string
          created_at?: string
          id?: string
          planned_workout_id?: string | null
          symptoms?: Json | null
          zone_minutes?: Json | null
        }
        Update: {
          actual_session?: Json
          athlete_id?: string
          completed_date?: string
          created_at?: string
          id?: string
          planned_workout_id?: string | null
          symptoms?: Json | null
          zone_minutes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_workouts_planned_workout_id_fkey"
            columns: ["planned_workout_id"]
            isOneToOne: false
            referencedRelation: "planned_workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      durability_assessments: {
        Row: {
          assessed_date: string
          assigned_modules: string[]
          athlete_id: string
          created_at: string
          id: string
          results: Json
        }
        Insert: {
          assessed_date: string
          assigned_modules?: string[]
          athlete_id: string
          created_at?: string
          id?: string
          results: Json
        }
        Update: {
          assessed_date?: string
          assigned_modules?: string[]
          athlete_id?: string
          created_at?: string
          id?: string
          results?: Json
        }
        Relationships: [
          {
            foreignKeyName: "durability_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      garmin_activities: {
        Row: {
          activity_type: string | null
          athlete_id: string | null
          avg_hr: number | null
          avg_pace_sec_per_mile: number | null
          cadence_avg: number | null
          created_at: string
          device_name: string | null
          distance_m: number | null
          duration_s: number | null
          fit_laps: Json | null
          fit_records: Json | null
          fit_summary: Json | null
          garmin_activity_id: string | null
          garmin_user_id: string | null
          id: string
          max_hr: number | null
          source: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          activity_type?: string | null
          athlete_id?: string | null
          avg_hr?: number | null
          avg_pace_sec_per_mile?: number | null
          cadence_avg?: number | null
          created_at?: string
          device_name?: string | null
          distance_m?: number | null
          duration_s?: number | null
          fit_laps?: Json | null
          fit_records?: Json | null
          fit_summary?: Json | null
          garmin_activity_id?: string | null
          garmin_user_id?: string | null
          id?: string
          max_hr?: number | null
          source?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          activity_type?: string | null
          athlete_id?: string | null
          avg_hr?: number | null
          avg_pace_sec_per_mile?: number | null
          cadence_avg?: number | null
          created_at?: string
          device_name?: string | null
          distance_m?: number | null
          duration_s?: number | null
          fit_laps?: Json | null
          fit_records?: Json | null
          fit_summary?: Json | null
          garmin_activity_id?: string | null
          garmin_user_id?: string | null
          id?: string
          max_hr?: number | null
          source?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      garmin_health_metrics: {
        Row: {
          athlete_id: string | null
          body_battery: number | null
          created_at: string
          garmin_user_id: string | null
          hrv_status: number | null
          id: string
          raw_payload: Json | null
          readiness_components: Json | null
          readiness_score: number | null
          resting_heart_rate: number | null
          sleep_duration_seconds: number | null
          sleep_score: number | null
          source: string | null
          stress_avg: number | null
          summary_date: string
          updated_at: string
        }
        Insert: {
          athlete_id?: string | null
          body_battery?: number | null
          created_at?: string
          garmin_user_id?: string | null
          hrv_status?: number | null
          id?: string
          raw_payload?: Json | null
          readiness_components?: Json | null
          readiness_score?: number | null
          resting_heart_rate?: number | null
          sleep_duration_seconds?: number | null
          sleep_score?: number | null
          source?: string | null
          stress_avg?: number | null
          summary_date: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string | null
          body_battery?: number | null
          created_at?: string
          garmin_user_id?: string | null
          hrv_status?: number | null
          id?: string
          raw_payload?: Json | null
          readiness_components?: Json | null
          readiness_score?: number | null
          resting_heart_rate?: number | null
          sleep_duration_seconds?: number | null
          sleep_score?: number | null
          source?: string | null
          stress_avg?: number | null
          summary_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      garmin_oauth_states: {
        Row: {
          athlete_id: string
          code_verifier: string
          created_at: string
          expires_at: string
          state: string
        }
        Insert: {
          athlete_id: string
          code_verifier: string
          created_at?: string
          expires_at: string
          state: string
        }
        Update: {
          athlete_id?: string
          code_verifier?: string
          created_at?: string
          expires_at?: string
          state?: string
        }
        Relationships: []
      }
      garmin_tokens: {
        Row: {
          access_token: string
          access_token_expires_at: string
          athlete_id: string
          created_at: string
          garmin_user_id: string
          id: string
          refresh_token: string
          refresh_token_expires_at: string | null
          scopes: string[]
          token_type: string
          updated_at: string
        }
        Insert: {
          access_token: string
          access_token_expires_at: string
          athlete_id: string
          created_at?: string
          garmin_user_id: string
          id?: string
          refresh_token: string
          refresh_token_expires_at?: string | null
          scopes?: string[]
          token_type?: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          access_token_expires_at?: string
          athlete_id?: string
          created_at?: string
          garmin_user_id?: string
          id?: string
          refresh_token?: string
          refresh_token_expires_at?: string | null
          scopes?: string[]
          token_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      garmin_webhook_events: {
        Row: {
          error: string | null
          event_type: string
          garmin_user_id: string | null
          id: string
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
        }
        Insert: {
          error?: string | null
          event_type: string
          garmin_user_id?: string | null
          id?: string
          payload: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Update: {
          error?: string | null
          event_type?: string
          garmin_user_id?: string | null
          id?: string
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
        }
        Relationships: []
      }
      goal_races: {
        Row: {
          athlete_id: string
          created_at: string
          distance: string
          id: string
          is_active: boolean
          race_date: string
          race_name: string | null
          terrain: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          distance: string
          id?: string
          is_active?: boolean
          race_date: string
          race_name?: string | null
          terrain?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          distance?: string
          id?: string
          is_active?: boolean
          race_date?: string
          race_name?: string | null
          terrain?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_races_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_workouts: {
        Row: {
          athlete_id: string
          created_at: string
          day_of_week: number
          durability_modules: string[] | null
          fueling_plan: Json | null
          id: string
          plan_id: string
          prescription: Json
          scheduled_date: string
          session_type: string
          status: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          day_of_week: number
          durability_modules?: string[] | null
          fueling_plan?: Json | null
          id?: string
          plan_id: string
          prescription: Json
          scheduled_date: string
          session_type: string
          status?: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          day_of_week?: number
          durability_modules?: string[] | null
          fueling_plan?: Json | null
          id?: string
          plan_id?: string
          prescription?: Json
          scheduled_date?: string
          session_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_workouts_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_workouts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      strava_oauth_states: {
        Row: {
          athlete_id: string
          created_at: string
          expires_at: string
          state: string
        }
        Insert: {
          athlete_id: string
          created_at?: string
          expires_at: string
          state: string
        }
        Update: {
          athlete_id?: string
          created_at?: string
          expires_at?: string
          state?: string
        }
        Relationships: []
      }
      strava_tokens: {
        Row: {
          access_token: string
          access_token_expires_at: string
          athlete_id: string
          created_at: string
          id: string
          refresh_token: string
          scopes: string[]
          strava_athlete_id: number
          updated_at: string
        }
        Insert: {
          access_token: string
          access_token_expires_at: string
          athlete_id: string
          created_at?: string
          id?: string
          refresh_token: string
          scopes?: string[]
          strava_athlete_id: number
          updated_at?: string
        }
        Update: {
          access_token?: string
          access_token_expires_at?: string
          athlete_id?: string
          created_at?: string
          id?: string
          refresh_token?: string
          scopes?: string[]
          strava_athlete_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      strava_webhook_events: {
        Row: {
          error: string | null
          event_type: string
          id: string
          object_id: number | null
          payload: Json
          processed_at: string | null
          received_at: string
          status: string
          strava_athlete_id: number | null
        }
        Insert: {
          error?: string | null
          event_type: string
          id?: string
          object_id?: number | null
          payload: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          strava_athlete_id?: number | null
        }
        Update: {
          error?: string | null
          event_type?: string
          id?: string
          object_id?: number | null
          payload?: Json
          processed_at?: string | null
          received_at?: string
          status?: string
          strava_athlete_id?: number | null
        }
        Relationships: []
      }
      symptom_logs: {
        Row: {
          athlete_id: string
          bony_tenderness: boolean
          created_at: string
          gait_change: boolean
          id: string
          injury_status: string | null
          logged_date: string
          morning_pain: number | null
          morning_stiffness_minutes: number | null
          notes: string | null
          numbness: boolean
          pain_site: string | null
          post_activity_pain: number | null
          swelling: boolean
        }
        Insert: {
          athlete_id: string
          bony_tenderness?: boolean
          created_at?: string
          gait_change?: boolean
          id?: string
          injury_status?: string | null
          logged_date: string
          morning_pain?: number | null
          morning_stiffness_minutes?: number | null
          notes?: string | null
          numbness?: boolean
          pain_site?: string | null
          post_activity_pain?: number | null
          swelling?: boolean
        }
        Update: {
          athlete_id?: string
          bony_tenderness?: boolean
          created_at?: string
          gait_change?: boolean
          id?: string
          injury_status?: string | null
          logged_date?: string
          morning_pain?: number | null
          morning_stiffness_minutes?: number | null
          notes?: string | null
          numbness?: boolean
          pain_site?: string | null
          post_activity_pain?: number | null
          swelling?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          athlete_id: string
          created_at: string
          end_date: string
          goal_race_id: string | null
          id: string
          is_active: boolean
          plan_type: string
          start_date: string
          vdot_at_creation: number
        }
        Insert: {
          athlete_id: string
          created_at?: string
          end_date: string
          goal_race_id?: string | null
          id?: string
          is_active?: boolean
          plan_type: string
          start_date: string
          vdot_at_creation: number
        }
        Update: {
          athlete_id?: string
          created_at?: string
          end_date?: string
          goal_race_id?: string | null
          id?: string
          is_active?: boolean
          plan_type?: string
          start_date?: string
          vdot_at_creation?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plans_goal_race_id_fkey"
            columns: ["goal_race_id"]
            isOneToOne: false
            referencedRelation: "goal_races"
            referencedColumns: ["id"]
          },
        ]
      }
      vdot_history: {
        Row: {
          athlete_id: string
          calculated_at: string
          id: string
          is_current: boolean
          race_distance_m: number | null
          race_time_seconds: number | null
          source: string
          vdot: number
        }
        Insert: {
          athlete_id: string
          calculated_at?: string
          id?: string
          is_current?: boolean
          race_distance_m?: number | null
          race_time_seconds?: number | null
          source: string
          vdot: number
        }
        Update: {
          athlete_id?: string
          calculated_at?: string
          id?: string
          is_current?: boolean
          race_distance_m?: number | null
          race_time_seconds?: number | null
          source?: string
          vdot?: number
        }
        Relationships: [
          {
            foreignKeyName: "vdot_history_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athletes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      restore_training_plan: {
        Args: {
          plan_backup: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Helper type aliases for backward compatibility
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
