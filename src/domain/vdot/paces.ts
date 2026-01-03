/**
 * Pace Zone Calculator
 * 
 * Derives training pace zones from VDOT
 * Based on Daniels' Running Formula zones
 * 
 * Zones:
 * - E (Easy): 59-74% VO2max - Recovery and base building
 * - M (Marathon): ~75-84% VO2max - Marathon race pace
 * - T (Threshold): ~83-88% VO2max - Lactate threshold
 * - I (Interval): ~95-100% VO2max - VO2max development  
 * - R (Repetition): >100% VO2max - Speed and economy
 */

import type { PaceZones } from '../types/session';

/**
 * VDOT to pace lookup table
 * Maps VDOT values to pace per mile in seconds
 * 
 * Source: Daniels' Running Formula tables
 * Values interpolated for precision
 */
const VDOT_PACE_TABLE: Record<number, { E: [number, number]; M: number; T: number; I: number; R: number }> = {
    30: { E: [720, 780], M: 689, T: 652, I: 600, R: 540 },
    31: { E: [702, 762], M: 671, T: 636, I: 585, R: 527 },
    32: { E: [684, 744], M: 654, T: 620, I: 571, R: 514 },
    33: { E: [666, 726], M: 638, T: 605, I: 558, R: 502 },
    34: { E: [648, 708], M: 622, T: 590, I: 545, R: 490 },
    35: { E: [636, 690], M: 607, T: 576, I: 533, R: 479 },
    36: { E: [624, 678], M: 593, T: 563, I: 521, R: 468 },
    37: { E: [612, 666], M: 579, T: 550, I: 509, R: 458 },
    38: { E: [600, 654], M: 566, T: 538, I: 498, R: 448 },
    39: { E: [588, 642], M: 553, T: 526, I: 487, R: 438 },
    40: { E: [576, 630], M: 541, T: 515, I: 477, R: 429 },
    41: { E: [564, 618], M: 529, T: 504, I: 467, R: 420 },
    42: { E: [552, 606], M: 518, T: 494, I: 458, R: 411 },
    43: { E: [546, 594], M: 507, T: 484, I: 449, R: 403 },
    44: { E: [534, 588], M: 497, T: 474, I: 440, R: 395 },
    45: { E: [528, 576], M: 487, T: 465, I: 432, R: 387 },
    46: { E: [516, 570], M: 478, T: 456, I: 424, R: 380 },
    47: { E: [510, 558], M: 469, T: 448, I: 416, R: 373 },
    48: { E: [504, 552], M: 460, T: 440, I: 408, R: 366 },
    49: { E: [498, 546], M: 452, T: 432, I: 401, R: 360 },
    50: { E: [492, 540], M: 444, T: 424, I: 394, R: 354 },
    51: { E: [486, 534], M: 436, T: 417, I: 387, R: 348 },
    52: { E: [480, 528], M: 429, T: 410, I: 381, R: 342 },
    53: { E: [474, 522], M: 422, T: 403, I: 375, R: 337 },
    54: { E: [468, 516], M: 415, T: 397, I: 369, R: 332 },
    55: { E: [462, 510], M: 408, T: 391, I: 363, R: 327 },
    56: { E: [456, 504], M: 402, T: 385, I: 358, R: 322 },
    57: { E: [450, 498], M: 396, T: 379, I: 353, R: 317 },
    58: { E: [444, 492], M: 390, T: 374, I: 348, R: 313 },
    59: { E: [438, 486], M: 384, T: 369, I: 343, R: 309 },
    60: { E: [432, 480], M: 379, T: 364, I: 338, R: 305 },
    61: { E: [426, 474], M: 374, T: 359, I: 334, R: 301 },
    62: { E: [420, 468], M: 369, T: 354, I: 330, R: 297 },
    63: { E: [420, 462], M: 364, T: 350, I: 326, R: 293 },
    64: { E: [414, 456], M: 359, T: 346, I: 322, R: 289 },
    65: { E: [408, 450], M: 355, T: 342, I: 318, R: 286 },
    66: { E: [402, 450], M: 351, T: 338, I: 314, R: 283 },
    67: { E: [402, 444], M: 347, T: 334, I: 311, R: 280 },
    68: { E: [396, 438], M: 343, T: 330, I: 307, R: 277 },
    69: { E: [390, 438], M: 339, T: 326, I: 304, R: 274 },
    70: { E: [390, 432], M: 335, T: 323, I: 301, R: 271 },
    71: { E: [384, 426], M: 331, T: 319, I: 298, R: 268 },
    72: { E: [384, 426], M: 328, T: 316, I: 295, R: 265 },
    73: { E: [378, 420], M: 324, T: 313, I: 292, R: 263 },
    74: { E: [378, 420], M: 321, T: 310, I: 289, R: 260 },
    75: { E: [372, 414], M: 318, T: 307, I: 286, R: 258 },
    76: { E: [372, 414], M: 315, T: 304, I: 283, R: 255 },
    77: { E: [366, 408], M: 312, T: 301, I: 281, R: 253 },
    78: { E: [366, 408], M: 309, T: 298, I: 278, R: 251 },
    79: { E: [360, 402], M: 306, T: 296, I: 276, R: 249 },
    80: { E: [360, 402], M: 303, T: 293, I: 274, R: 247 },
    85: { E: [342, 384], M: 288, T: 279, I: 261, R: 235 },
};

/**
 * Get the nearest VDOT value in the lookup table
 */
function getNearestVdot(vdot: number): number {
    const vdots = Object.keys(VDOT_PACE_TABLE).map(Number);
    const nearest = vdots.reduce((prev, curr) =>
        Math.abs(curr - vdot) < Math.abs(prev - vdot) ? curr : prev
    );
    return nearest;
}

/**
 * Interpolate between two VDOT values for more precise pacing
 */
function interpolatePace(vdot: number, getPace: (v: number) => number): number {
    const lower = Math.floor(vdot);
    const upper = Math.ceil(vdot);

    if (lower === upper || !VDOT_PACE_TABLE[lower] || !VDOT_PACE_TABLE[upper]) {
        const nearest = getNearestVdot(vdot);
        return getPace(nearest);
    }

    const fraction = vdot - lower;
    const lowerPace = getPace(lower);
    const upperPace = getPace(upper);

    return Math.round(lowerPace + (upperPace - lowerPace) * fraction);
}

/**
 * Calculate training pace zones from VDOT
 * 
 * @param vdot - Athlete's VDOT value
 * @returns PaceZones object with pace ranges for each zone
 * 
 * @example
 * const zones = calculatePaceZones(50);
 * // zones.E = { minSecPerMile: 492, maxSecPerMile: 540 }  // 8:12-9:00
 * // zones.M = { secPerMile: 444 }                          // 7:24
 * // zones.T = { secPerMile: 424 }                          // 7:04
 * // zones.I = { secPerMile: 394 }                          // 6:34
 * // zones.R = { secPerMile: 354 }                          // 5:54
 */
export function calculatePaceZones(vdot: number): PaceZones {
    const nearest = getNearestVdot(vdot);
    const table = VDOT_PACE_TABLE[nearest];

    if (!table) {
        throw new Error(`VDOT value ${vdot} is out of range (30-85)`);
    }

    return {
        E: {
            minSecPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].E[0]),
            maxSecPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].E[1]),
        },
        M: {
            secPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].M),
        },
        T: {
            secPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].T),
        },
        I: {
            secPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].I),
        },
        R: {
            secPerMile: interpolatePace(vdot, (v) => VDOT_PACE_TABLE[getNearestVdot(v)].R),
        },
    };
}

/**
 * Format pace (seconds per mile) to MM:SS string
 */
export function formatPace(secPerMile: number): string {
    const minutes = Math.floor(secPerMile / 60);
    const seconds = Math.round(secPerMile % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format a pace range to string
 */
export function formatPaceRange(minSec: number, maxSec: number): string {
    return `${formatPace(minSec)} - ${formatPace(maxSec)}`;
}

/**
 * Get all zones as formatted strings
 */
export function getFormattedPaceZones(vdot: number): Record<string, string> {
    const zones = calculatePaceZones(vdot);

    return {
        'Easy (E)': formatPaceRange(zones.E.minSecPerMile, zones.E.maxSecPerMile),
        'Marathon (M)': formatPace(zones.M.secPerMile),
        'Threshold (T)': formatPace(zones.T.secPerMile),
        'Interval (I)': formatPace(zones.I.secPerMile),
        'Repetition (R)': formatPace(zones.R.secPerMile),
    };
}
