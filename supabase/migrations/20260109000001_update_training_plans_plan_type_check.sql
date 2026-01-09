alter table training_plans
    drop constraint if exists training_plans_plan_type_check;

alter table training_plans
    add constraint training_plans_plan_type_check
    check (plan_type in (
        '5k',
        '10k',
        'half',
        'half_marathon',
        'marathon',
        'general',
        'base',
        'ultra'
    ));
