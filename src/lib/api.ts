export type ApiError = {
    message: string;
    data?: unknown;
};

export type ApiResult<T> =
    | { ok: true; status: number; data: T }
    | { ok: false; status: number; error: ApiError };

export interface ApiFetchOptions extends RequestInit {
    timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 15000;

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
            const message = (payload && typeof payload === 'object' && 'error' in payload)
                ? String((payload as { error: unknown }).error)
                : response.statusText || 'Request failed';

            return {
                ok: false,
                status: response.status,
                error: { message, data: payload ?? null },
            };
        }

        return {
            ok: true,
            status: response.status,
            data: payload as T,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Network error';
        return { ok: false, status: 0, error: { message } };
    } finally {
        clearTimeout(timeout);
    }
}
