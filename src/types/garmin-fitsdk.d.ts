/**
 * Type declarations for @garmin/fitsdk
 * 
 * The official Garmin FIT SDK doesn't ship with TypeScript types.
 * These declarations provide minimal typing for the features we use.
 */

declare module '@garmin/fitsdk' {
    export class Stream {
        static fromBuffer(buffer: Buffer): Stream;
        static fromArrayBuffer(buffer: ArrayBuffer): Stream;
    }

    export class Decoder {
        constructor(stream: Stream);
        isFIT(): boolean;
        checkIntegrity(): boolean;
        read(): {
            messages: {
                sessionMesgs?: Record<string, unknown>[];
                lapMesgs?: Record<string, unknown>[];
                recordMesgs?: Record<string, unknown>[];
                activityMesgs?: Record<string, unknown>[];
                [key: string]: unknown;
            };
            errors: string[];
        };
    }

    export interface SessionMessage {
        startTime?: Date;
        timestamp?: Date;
        sport?: string;
        subSport?: string;
        totalDistance?: number;
        totalElapsedTime?: number;
        totalTimerTime?: number;
        avgHeartRate?: number;
        maxHeartRate?: number;
        avgCadence?: number;
        avgSpeed?: number;
        maxSpeed?: number;
        totalAscent?: number;
        totalDescent?: number;
        totalCalories?: number;
        avgPower?: number;
        maxPower?: number;
        normalizedPower?: number;
        [key: string]: unknown;
    }

    export interface LapMessage {
        startTime?: Date;
        timestamp?: Date;
        totalDistance?: number;
        totalElapsedTime?: number;
        totalTimerTime?: number;
        avgHeartRate?: number;
        maxHeartRate?: number;
        avgCadence?: number;
        avgSpeed?: number;
        maxSpeed?: number;
        lapTrigger?: string;
        [key: string]: unknown;
    }

    export interface RecordMessage {
        timestamp?: Date;
        positionLat?: number;
        positionLong?: number;
        distance?: number;
        heartRate?: number;
        cadence?: number;
        speed?: number;
        altitude?: number;
        power?: number;
        [key: string]: unknown;
    }

    export interface ActivityMessage {
        timestamp?: Date;
        totalTimerTime?: number;
        numSessions?: number;
        type?: string;
        event?: string;
        eventType?: string;
        [key: string]: unknown;
    }
}
