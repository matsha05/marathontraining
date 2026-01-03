/**
 * VDOT Calculator
 * 
 * Pure functions for calculating VDOT from race performances
 * Based on Jack Daniels' Running Formula
 * 
 * VDOT is an oxygen uptake value that correlates running performance
 * across different race distances. A single VDOT value can predict
 * equivalent performances and derive appropriate training paces.
 */

/**
 * Calculate VDOT from a race performance
 * 
 * @param distanceMeters - Race distance in meters
 * @param timeSeconds - Finish time in seconds
 * @returns VDOT value (typically 30-85 for most runners)
 * 
 * @example
 * // 5K in 20:00 = 47.5 VDOT
 * vdotFromRace(5000, 1200)
 * 
 * // Marathon in 3:30:00 = 45.8 VDOT
 * vdotFromRace(42195, 12600)
 */
export function vdotFromRace(distanceMeters: number, timeSeconds: number): number {
    // Velocity in meters per minute
    const velocity = distanceMeters / (timeSeconds / 60);

    // Time in minutes
    const timeMinutes = timeSeconds / 60;

    // Percent VO2max (how hard you can run for this duration)
    const percentVO2max = calculatePercentVO2max(timeMinutes);

    // VO2 cost (oxygen cost of running at this velocity)
    const vo2Cost = calculateVO2Cost(velocity);

    // VDOT = VO2 cost / percent VO2max
    const vdot = vo2Cost / percentVO2max;

    return Math.round(vdot * 10) / 10;
}

/**
 * Calculate percent of VO2max that can be sustained for a given duration
 * Based on Daniels' formula
 */
function calculatePercentVO2max(timeMinutes: number): number {
    return 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes) +
        0.2989558 * Math.exp(-0.1932605 * timeMinutes);
}

/**
 * Calculate oxygen cost of running at a given velocity
 * @param velocity - Meters per minute
 */
function calculateVO2Cost(velocity: number): number {
    return -4.60 + 0.182258 * velocity + 0.000104 * velocity * velocity;
}

/**
 * Predict race time for a given distance based on VDOT
 * 
 * @param vdot - Current VDOT value
 * @param distanceMeters - Target race distance
 * @returns Predicted time in seconds
 * 
 * @example
 * // With VDOT 50, predict marathon time
 * predictRaceTime(50, 42195) // Returns ~12000 (3:20:00)
 */
export function predictRaceTime(vdot: number, distanceMeters: number): number {
    // Binary search for the time that produces this VDOT
    let low = 60;  // 1 minute minimum
    let high = 86400;  // 24 hours maximum

    while (high - low > 1) {
        const mid = Math.floor((low + high) / 2);
        const calculatedVdot = vdotFromRace(distanceMeters, mid);

        if (calculatedVdot > vdot) {
            low = mid;
        } else {
            high = mid;
        }
    }

    return Math.round((low + high) / 2);
}

/**
 * Standard race distances in meters
 */
export const RACE_DISTANCES = {
    '5k': 5000,
    '10k': 10000,
    'half': 21097.5,
    'marathon': 42195,
    'ultra_50k': 50000,
    'ultra_50m': 80467.2,
    'ultra_100k': 100000,
    'ultra_100m': 160934.4,
} as const;

/**
 * Common race distance shortcuts
 */
export type StandardRaceDistance = keyof typeof RACE_DISTANCES;

/**
 * Calculate equivalent race times across distances
 * 
 * @param vdot - Current VDOT value
 * @returns Object with predicted times for standard distances
 */
export function getEquivalentRaceTimes(vdot: number): Record<StandardRaceDistance, number> {
    return {
        '5k': predictRaceTime(vdot, RACE_DISTANCES['5k']),
        '10k': predictRaceTime(vdot, RACE_DISTANCES['10k']),
        'half': predictRaceTime(vdot, RACE_DISTANCES['half']),
        'marathon': predictRaceTime(vdot, RACE_DISTANCES['marathon']),
        'ultra_50k': predictRaceTime(vdot, RACE_DISTANCES['ultra_50k']),
        'ultra_50m': predictRaceTime(vdot, RACE_DISTANCES['ultra_50m']),
        'ultra_100k': predictRaceTime(vdot, RACE_DISTANCES['ultra_100k']),
        'ultra_100m': predictRaceTime(vdot, RACE_DISTANCES['ultra_100m']),
    };
}

/**
 * Format seconds to HH:MM:SS or MM:SS string
 */
export function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Parse time string (HH:MM:SS or MM:SS) to seconds
 */
export function parseTime(timeString: string): number {
    const parts = timeString.split(':').map(Number);

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    throw new Error(`Invalid time format: ${timeString}`);
}
