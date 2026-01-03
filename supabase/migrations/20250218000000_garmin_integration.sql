create extension if not exists pgcrypto;

create table if not exists garmin_oauth_states (
    state text primary key,
    athlete_id uuid not null,
    code_verifier text not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create table if not exists garmin_tokens (
    id uuid primary key default gen_random_uuid(),
    athlete_id uuid not null,
    garmin_user_id text not null,
    access_token text not null,
    refresh_token text not null,
    access_token_expires_at timestamptz not null,
    refresh_token_expires_at timestamptz,
    token_type text not null default 'bearer',
    scopes text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (athlete_id),
    unique (garmin_user_id)
);

create table if not exists garmin_webhook_events (
    id uuid primary key default gen_random_uuid(),
    garmin_user_id text,
    event_type text not null,
    payload jsonb not null,
    received_at timestamptz not null default now(),
    processed_at timestamptz,
    status text not null default 'received',
    error text
);

create table if not exists garmin_health_metrics (
    id uuid primary key default gen_random_uuid(),
    athlete_id uuid,
    garmin_user_id text,
    summary_date date not null,
    sleep_duration_seconds integer,
    sleep_score integer,
    hrv_status integer,
    resting_heart_rate integer,
    body_battery integer,
    stress_avg integer,
    readiness_score integer,
    readiness_components jsonb,
    source text,
    raw_payload jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (athlete_id, summary_date)
);

create table if not exists garmin_activities (
    id uuid primary key default gen_random_uuid(),
    athlete_id uuid,
    garmin_user_id text,
    garmin_activity_id text,
    start_time timestamptz,
    activity_type text,
    distance_m double precision,
    duration_s integer,
    avg_pace_sec_per_mile double precision,
    avg_hr integer,
    max_hr integer,
    cadence_avg integer,
    device_name text,
    fit_summary jsonb,
    fit_laps jsonb,
    fit_records jsonb,
    source text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (garmin_activity_id)
);

alter table garmin_oauth_states enable row level security;
alter table garmin_tokens enable row level security;
alter table garmin_webhook_events enable row level security;
alter table garmin_health_metrics enable row level security;
alter table garmin_activities enable row level security;

create policy "service role manage garmin oauth states" on garmin_oauth_states
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage garmin tokens" on garmin_tokens
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage garmin webhook events" on garmin_webhook_events
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage garmin health" on garmin_health_metrics
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage garmin activities" on garmin_activities
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');
