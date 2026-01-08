create or replace function delete_user_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_garmin_user_ids text[];
    v_strava_athlete_ids bigint[];
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    select array_agg(distinct garmin_user_id)
    into v_garmin_user_ids
    from garmin_tokens
    where athlete_id = v_user_id
      and garmin_user_id is not null;

    select array_agg(distinct strava_athlete_id)
    into v_strava_athlete_ids
    from strava_tokens
    where athlete_id = v_user_id
      and strava_athlete_id is not null;

    delete from completed_workouts where athlete_id = v_user_id;
    delete from planned_workouts where athlete_id = v_user_id;
    delete from training_plans where athlete_id = v_user_id;
    delete from goal_races where athlete_id = v_user_id;
    delete from symptom_logs where athlete_id = v_user_id;
    delete from vdot_history where athlete_id = v_user_id;
    delete from durability_assessments where athlete_id = v_user_id;

    delete from garmin_activities where athlete_id = v_user_id;
    delete from garmin_health_metrics where athlete_id = v_user_id;
    delete from garmin_oauth_states where athlete_id = v_user_id;

    if v_garmin_user_ids is not null then
        delete from garmin_webhook_events where garmin_user_id = any (v_garmin_user_ids);
    end if;
    delete from garmin_tokens where athlete_id = v_user_id;

    delete from strava_oauth_states where athlete_id = v_user_id;
    if v_strava_athlete_ids is not null then
        delete from strava_webhook_events where strava_athlete_id = any (v_strava_athlete_ids);
    end if;
    delete from strava_tokens where athlete_id = v_user_id;

    delete from athletes where id = v_user_id;
end;
$$;

revoke all on function delete_user_account() from public;
grant execute on function delete_user_account() to authenticated;
