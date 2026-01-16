import { DEFAULT_TIMEOUT_SEC } from "@/constants/api";

export interface FetchOptions extends RequestInit {
    timeoutSeconds?: number;
}

export const fetchWithTimeout = async <T = any>(
    endpoint: string,
    requestBody: any,
    apiKey?: string,
    options: FetchOptions = {},
): Promise<T> => {
    const { timeoutSeconds = DEFAULT_TIMEOUT_SEC, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();     // cancels the fetch
    }, timeoutSeconds * 1000);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}),
                ...fetchOptions.headers,
            },
            body: requestBody,
            signal: controller.signal,
            ...fetchOptions,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Request failed (${response.status}): ${text}`);
        }

        // parse JSON
        return (await response.json()) as T;
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === "AbortError") {
            console.warn(`Request to ${endpoint} aborted after ${timeoutSeconds}s`);
            throw new Error(`Request timed out (${timeoutSeconds}s)`);
        }
        throw err;
    }
}