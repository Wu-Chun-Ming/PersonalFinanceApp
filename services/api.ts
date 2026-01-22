import { DEFAULT_TIMEOUT_SEC } from "@/constants/api";
import { AbortReason, AbortReasonType } from "@/types";

export interface FetchOptions extends RequestInit {
    timeoutSeconds?: number;
    abortReasonRef?: { current: AbortReasonType | null };
}

export const fetchWithTimeout = async <T = any>(
    endpoint: string,
    requestBody: any,
    apiKey?: string,
    options: FetchOptions = {},
): Promise<T> => {
    const {
        timeoutSeconds = DEFAULT_TIMEOUT_SEC,
        signal: externalSignal,
        abortReasonRef,
        ...fetchOptions
    } = options;
    const controller = new AbortController();
    if (externalSignal) {
        if (externalSignal.aborted) {
            abortReasonRef && (abortReasonRef.current = AbortReason.USER_ABORT);
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", () => {
                abortReasonRef && (abortReasonRef.current = AbortReason.USER_ABORT);
                controller.abort();
            });
        }
    }
    const timeoutId = setTimeout(() => {
        abortReasonRef && (abortReasonRef.current = AbortReason.TIMEOUT);
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
            switch (abortReasonRef?.current) {
                case AbortReason.TIMEOUT:
                    console.info(`Request to ${endpoint} timed out after ${timeoutSeconds}s`);
                    throw new Error(`Request timed out (${timeoutSeconds}s)`);
                case AbortReason.USER_ABORT:
                    console.info("Request cancelled by user");
                    throw new Error("Request cancelled by user");
                default:
                    console.info(`Request to ${endpoint} aborted without specific reason`);
                    throw new Error("Request aborted");
            }
        }
        throw err;
    }
}