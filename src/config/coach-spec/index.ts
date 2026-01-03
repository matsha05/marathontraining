/**
 * CoachSpec Configuration Barrel Export
 */

export { RACE_DISTANCE_CONFIGS, getRaceDistanceConfig } from './race-distances';
export type { RaceDistanceConfig } from './race-distances';

export {
    DAYS,
    STANDARD_WEEK_TEMPLATE,
    WEEK_TEMPLATES,
    getWeekTemplate,
    calculateWeeklyMileage,
    CUTBACK_CONFIG,
    isCutbackWeek,
} from './weekly-structure';
export type { CutbackConfig } from './weekly-structure';

export {
    STRENGTH_TEMPLATES,
    PHASE_STRENGTH_RULES,
    getStrengthTemplate,
    getPhaseStrengthRules,
    getAvailableTemplates,
    TEMPLATE_A,
    TEMPLATE_B,
    TEMPLATE_P,
    TEMPLATE_H,
    TEMPLATE_N,
} from './strength-templates';
export type { StrengthTemplateId, StrengthTemplate, PhaseStrengthRules } from './strength-templates';

export { COACHES, RESEARCH_SOURCES, METHODOLOGY_CATEGORIES, getCoach, getAllCoaches, getCoachesByCategory } from './methodology';
export type { Coach, ResearchSource } from './methodology';
