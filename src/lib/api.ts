export type ApiError = {
    message: string;
    code?: string;
    details?: unknown;
    data?: unknown;
};

export type ApiResult<T> =
    | { ok: true; status: number; data: T }
    | { ok: false; status: number; error: ApiError };

export interface ApiFetchOptions extends RequestInit {
    timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

function normalizeApiError(payload: unknown, fallbackMessage: string) {
    let message = fallbackMessage || 'Request failed';
    let code: string | undefined;
    let details: unknown;

    if (payload && typeof payload === 'object') {
        const payloadRecord = payload as Record<string, unknown>;
        if ('error' in payloadRecord) {
            const errorValue = payloadRecord.error;
            if (typeof errorValue === 'string') {
                message = errorValue;
            } else if (errorValue && typeof errorValue === 'object') {
                const errorRecord = errorValue as Record<string, unknown>;
                if (typeof errorRecord.message === 'string') message = errorRecord.message;
                if (typeof errorRecord.code === 'string') code = errorRecord.code;
                if ('details' in errorRecord) details = errorRecord.details;
            } else if (errorValue != null) {
                message = String(errorValue);
            }
        } else if (typeof payloadRecord.message === 'string') {
            message = payloadRecord.message;
        }

        if (details === undefined && 'details' in payloadRecord) {
            details = payloadRecord.details;
        }
        if (code === undefined && typeof payloadRecord.code === 'string') {
            code = payloadRecord.code;
        }
    }

    return { message, code, details };
}

export async function apiFetch<T = unknown>(
    input: RequestInfo | URL,
    init: ApiFetchOptions = {}
): Promise<ApiResult<T>> {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestInit } = init;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(input, {
            ...requestInit,
            signal: controller.signal,
        });

        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = response.status === 204
            ? null
            : isJson
                ? await response.json().catch(() => null)
                : await response.text().catch(() => null);

        if (!response.ok) {
            const { message, code, details } = normalizeApiError(payload, response.statusText || 'Request failed');

            return {
                ok: false,
                status: response.status,
                error: { message, code, details, data: payload ?? null },
            };
        }

        return {
            ok: true,
            status: response.status,
            data: payload as T,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        return { ok: false, status: 0, error: { message, code: 'NETWORK_ERROR' } };
    } finally {
        clearTimeout(timeout);
    }
}
