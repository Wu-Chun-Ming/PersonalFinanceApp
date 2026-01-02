export const OcrMode = {
    RECEIPT: 'receipt',
    ONLINE_SHOPPING: 'online_shopping'
} as const;

export type OcrModeType = (typeof OcrMode)[keyof typeof OcrMode];