create or replace function save_training_plan(plan jsonb, workouts jsonb)
returns void
language plpgsql
set search_path = public
as $$
declare
    v_athlete_id uuid;
    v_plan_id uuid;
begin
    v_athlete_id := auth.uid();
    if v_athlete_id is null then
        raise exception 'Not authenticated';
    end if;

    v_plan_id := (plan->>'id')::uuid;
    if v_plan_id is null then
        raise exception 'Missing plan id';
    end if;

    if (plan->>'athlete_id') is null then
        raise exception 'Missing athlete id';
    end if;

    if (plan->>'athlete_id')::uuid <> v_athlete_id then
        raise exception 'Athlete mismatch';
    end if;

    update training_plans
    set is_active = false
    where athlete_id = v_athlete_id
      and is_active = true;

    insert into training_plans (
        id,
        athlete_id,
        plan_type,
        vdot_at_creation,
        start_date,
        end_date,
        goal_race_id,
        is_active
    ) values (
        v_plan_id,
        v_athlete_id,
        plan->>'plan_type',
        (plan->>'vdot_at_creation')::double precision,
        plan->>'start_date',
        plan->>'end_date',
        nullif(plan->>'goal_race_id', '')::uuid,
        coalesce((plan->>'is_active')::boolean, true)
    )
    on conflict (id) do update set
        athlete_id = excluded.athlete_id,
        plan_type = excluded.plan_type,
        vdot_at_creation = excluded.vdot_at_creation,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        goal_race_id = excluded.goal_race_id,
        is_active = excluded.is_active;

    if workouts is null then
        return;
    end if;

    insert into planned_workouts (
        id,
        plan_id,
        athlete_id,
        scheduled_date,
        day_of_week,
        session_type,
        prescription,
        status,
        durability_modules,
        fueling_plan
    )
    select
        (w->>'id')::uuid,
        v_plan_id,
        v_athlete_id,
        w->>'scheduled_date',
        (w->>'day_of_week')::int,
        w->>'session_type',
        w->'prescription',
        coalesce(w->>'status', 'planned'),
        case
            when jsonb_typeof(w->'durability_modules') = 'array' then
                array(select jsonb_array_elements_text(w->'durability_modules'))
            else null
        end,
        w->'fueling_plan'
    from jsonb_array_elements(workouts) as w
    on conflict (id) do update set
        plan_id = excluded.plan_id,
        athlete_id = excluded.athlete_id,
        scheduled_date = excluded.scheduled_date,
        day_of_week = excluded.day_of_week,
        session_type = excluded.session_type,
        prescription = excluded.prescription,
        status = excluded.status,
        durability_modules = excluded.durability_modules,
        fueling_plan = excluded.fueling_plan;
end;
$$;

grant execute on function save_training_plan(jsonb, jsonb) to authenticated;
