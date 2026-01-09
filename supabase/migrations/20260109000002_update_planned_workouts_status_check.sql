update planned_workouts
set status = 'planned'
where status = 'scheduled';

alter table planned_workouts
    drop constraint if exists planned_workouts_status_check;

alter table planned_workouts
    add constraint planned_workouts_status_check
    check (status in (
        'planned',
        'completed',
        'partial',
        'skipped'
    ));
