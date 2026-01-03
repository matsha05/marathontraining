/**
 * Durability Router
 * 
 * Routes athletes to appropriate durability modules based on assessments
 */

import { DURABILITY_ASSESSMENTS, getModulesForFailedAssessments } from './assessments';
import { DURABILITY_MODULES, DurabilityModule } from './modules';

export interface AssessmentResults {
    [assessmentId: string]: {
        result: 'pass' | 'fail' | 'partial';
        leftValue?: number;
        rightValue?: number;
        notes?: string;
    };
}

export interface DurabilityPrescription {
    priorityModules: DurabilityModule[];
    maintenanceModules: DurabilityModule[];
    totalDailyMinutes: number;
    weeklySchedule: Record<string, string[]>;
}

/**
 * Generate durability prescription based on assessment results
 */
export function generateDurabilityPrescription(results: AssessmentResults): DurabilityPrescription {
    const failedAssessments = Object.entries(results)
        .filter(([_, r]) => r.result === 'fail' || r.result === 'partial')
        .map(([id]) => id);

    const prescribedModuleIds = getModulesForFailedAssessments(failedAssessments);
    const priorityModules = prescribedModuleIds
        .map(id => DURABILITY_MODULES[id])
        .filter(Boolean);

    // Default maintenance modules for all runners
    const maintenanceModuleIds = ['glute_activation', 'core_stability', 'thoracic_mobility'];
    const maintenanceModules = maintenanceModuleIds
        .filter(id => !prescribedModuleIds.includes(id))
        .map(id => DURABILITY_MODULES[id])
        .filter(Boolean);

    // Calculate daily time
    const dailyModules = [...priorityModules, ...maintenanceModules]
        .filter(m => m.frequency === 'daily');
    const totalDailyMinutes = dailyModules.reduce((sum, m) => sum + m.durationMin, 0);

    // Build weekly schedule
    const weeklySchedule: Record<string, string[]> = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
    };

    // Daily modules go every day
    const dailyIds = dailyModules.map(m => m.id);
    Object.keys(weeklySchedule).forEach(day => {
        weeklySchedule[day].push(...dailyIds);
    });

    // Every other day modules on MWF
    const eodModules = [...priorityModules, ...maintenanceModules]
        .filter(m => m.frequency === 'every_other_day');
    ['monday', 'wednesday', 'friday'].forEach(day => {
        weeklySchedule[day].push(...eodModules.map(m => m.id));
    });

    // 3x week modules on TuThSa
    const threeXModules = [...priorityModules, ...maintenanceModules]
        .filter(m => m.frequency === '3x_week');
    ['tuesday', 'thursday', 'saturday'].forEach(day => {
        weeklySchedule[day].push(...threeXModules.map(m => m.id));
    });

    return {
        priorityModules,
        maintenanceModules,
        totalDailyMinutes,
        weeklySchedule,
    };
}

export function getDailyDurabilityModules(
    prescription: DurabilityPrescription,
    dayOfWeek: string
): DurabilityModule[] {
    const moduleIds = prescription.weeklySchedule[dayOfWeek.toLowerCase()] || [];
    return moduleIds
        .map(id => DURABILITY_MODULES[id])
        .filter(Boolean);
}
