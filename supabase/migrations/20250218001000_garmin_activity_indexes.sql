alter table garmin_activities drop constraint if exists garmin_activities_garmin_activity_id_key;

create unique index if not exists garmin_activities_unique_athlete_source_activity
    on garmin_activities (athlete_id, source, garmin_activity_id)
    where athlete_id is not null and garmin_activity_id is not null;

create index if not exists garmin_webhook_events_status_idx
    on garmin_webhook_events (status, received_at);
