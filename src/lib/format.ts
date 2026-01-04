/**
 * Format Utilities
 *
 * Shared formatting functions for consistent display across the app.
 * Single source of truth for pace, time, and distance formatting.
 */

// =============================================================================
// PACE FORMATTING
// =============================================================================

/**
 * Format seconds per mile to MM:SS pace string
 * @param secondsPerMile - Pace in seconds per mile
 * @returns Formatted pace string like "8:30"
 */
export function formatPace(secondsPerMile: number): string {
    if (!secondsPerMile || secondsPerMile <= 0) return "--:--";
    const minutes = Math.floor(secondsPerMile / 60);
    const seconds = Math.round(secondsPerMile % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format a pace range from min to max seconds per mile
 * @param minSec - Minimum pace (faster) in seconds per mile
 * @param maxSec - Maximum pace (slower) in seconds per mile
 * @returns Formatted range like "8:30 - 9:00"
 */
export function formatPaceRange(minSec: number, maxSec: number): string {
    return `${formatPace(minSec)} - ${formatPace(maxSec)}`;
}

/**
 * Get formatted pace for a given zone from plan paces
 */
export function getPaceForZone(
    zone: string,
    paces: {
        easy: { min: number; max: number };
        marathon: number;
        threshold: number;
        interval: number;
        repetition: number;
    }
): string {
    switch (zone) {
        case "E":
            return formatPaceRange(paces.easy.min, paces.easy.max);
        case "M":
            return formatPace(paces.marathon);
        case "T":
            return formatPace(paces.threshold);
        case "I":
            return formatPace(paces.interval);
        case "R":
            return formatPace(paces.repetition);
        default:
            return formatPaceRange(paces.easy.min, paces.easy.max);
    }
}

// =============================================================================
// TIME FORMATTING
// =============================================================================

/**
 * Format total seconds to HH:MM:SS or MM:SS
 */
export function formatTime(totalSeconds: number): string {
    if (!totalSeconds || totalSeconds <= 0) return "0:00";

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.round(totalSeconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Format minutes to human-readable duration
 * @param minutes - Duration in minutes
 * @returns Formatted string like "45 min" or "1h 30m"
 */
export function formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return "0 min";

    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}m`;
}

// =============================================================================
// DISTANCE FORMATTING
// =============================================================================

/**
 * Format distance in miles
 */
export function formatDistance(miles: number): string {
    if (!miles || miles <= 0) return "0 mi";

    if (miles < 1) {
        return `${(miles * 5280).toFixed(0)} ft`;
    }

    if (miles === Math.floor(miles)) {
        return `${miles} mi`;
    }

    return `${miles.toFixed(1)} mi`;
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Get short day name from day of week number
 */
export function getDayName(dayOfWeek: number): string {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayOfWeek] || "???";
}

/**
 * Get full day name from day of week number
 */
export function getFullDayName(dayOfWeek: number): string {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    return days[dayOfWeek] || "Unknown";
}

/**
 * Format date to readable string
 */
export function formatDate(
    dateStr: string,
    options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
    }
): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", options);
    } catch {
        return dateStr;
    }
}

/**
 * Format date relative to today
 */
export function formatRelativeDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const diffDays = Math.round(
            (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        if (diffDays === -1) return "Yesterday";
        if (diffDays > 0 && diffDays <= 7)
            return getFullDayName(date.getDay());
        if (diffDays < 0 && diffDays >= -7)
            return `Last ${getFullDayName(date.getDay())}`;

        return formatDate(dateStr);
    } catch {
        return dateStr;
    }
}
