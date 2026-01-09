import type { WeekBlockType } from './types';

const BLOCK_LABELS: Record<WeekBlockType, string> = {
    base_official: 'Base',
    maintenance: 'Maintenance',
    race_plan: 'Race Plan',
};

export function getBlockLabel(
    blockType?: WeekBlockType,
    options?: { includeRacePlan?: boolean }
): string | null {
    if (!blockType) return null;
    if (blockType === 'race_plan' && !options?.includeRacePlan) return null;
    return BLOCK_LABELS[blockType] ?? null;
}
