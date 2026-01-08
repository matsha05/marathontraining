import { apiFetch, type ApiFetchOptions } from '@/lib/api';
import type { PlanRepositoryError, PlanResult } from './types';

export async function planApiRequest<T>(
    url: string,
    failureCode: PlanRepositoryError['code'],
    init?: ApiFetchOptions
): Promise<PlanResult<T>> {
    const response = await apiFetch<T>(url, init);
    if (!response.ok) {
        const code = response.status === 401
            ? 'AUTH_REQUIRED'
            : response.error.code === 'NETWORK_ERROR' || response.status === 0
                ? 'NETWORK_ERROR'
                : failureCode;

        return {
            success: false,
            error: {
                code,
                message: response.error.message,
                details: response.error.details ?? response.error.data,
            },
        };
    }

    return { success: true, data: response.data };
}
