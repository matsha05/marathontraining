import { z } from 'zod';

const numberFromParam = (schema: z.ZodNumber) => z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
        return Number(value);
    }
    return value;
}, schema);

export const stravaWebhookQuerySchema = z.object({
    'hub.mode': z.string().optional(),
    'hub.challenge': z.string().optional(),
    'hub.verify_token': z.string().optional(),
});

export const stravaWebhookPayloadSchema = z.object({
    object_type: z.string().min(1),
    aspect_type: z.string().min(1),
    object_id: numberFromParam(z.number().int().positive()),
    owner_id: numberFromParam(z.number().int().positive()),
    event_time: numberFromParam(z.number().int().positive()).optional(),
}).passthrough();

export const stravaConnectQuerySchema = z.object({
    from: z.enum(['settings', 'onboarding']).optional(),
    next: z.string().optional(),
});

export const stravaCallbackQuerySchema = z.object({
    code: z.string().optional(),
    state: z.string().optional(),
    error: z.string().optional(),
    error_description: z.string().optional(),
});

export const stravaSyncQuerySchema = z.object({
    days: numberFromParam(z.number().int().positive().max(365)).optional(),
    limit: numberFromParam(z.number().int().positive().max(200)).optional(),
});

export const stravaProcessQuerySchema = z.object({
    limit: numberFromParam(z.number().int().positive().max(100)).optional(),
    key: z.string().optional(),
});
