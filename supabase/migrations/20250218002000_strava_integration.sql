create table if not exists strava_oauth_states (
    state text primary key,
    athlete_id uuid not null,
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create table if not exists strava_tokens (
    id uuid primary key default gen_random_uuid(),
    athlete_id uuid not null,
    strava_athlete_id bigint not null,
    access_token text not null,
    refresh_token text not null,
    access_token_expires_at timestamptz not null,
    scopes text[] not null default '{}',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (athlete_id),
    unique (strava_athlete_id)
);

create table if not exists strava_webhook_events (
    id uuid primary key default gen_random_uuid(),
    strava_athlete_id bigint,
    object_id bigint,
    event_type text not null,
    payload jsonb not null,
    received_at timestamptz not null default now(),
    processed_at timestamptz,
    status text not null default 'received',
    error text
);

alter table strava_oauth_states enable row level security;
alter table strava_tokens enable row level security;
alter table strava_webhook_events enable row level security;

create policy "service role manage strava oauth states" on strava_oauth_states
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage strava tokens" on strava_tokens
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "service role manage strava webhook events" on strava_webhook_events
    for all
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create index if not exists strava_webhook_events_status_idx
    on strava_webhook_events (status, received_at);
