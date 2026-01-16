export const OcrMode = {
    RECEIPT: 'receipt',
    ONLINE_SHOPPING: 'online_shopping'
} as const;

export type OcrModeType = (typeof OcrMode)[keyof typeof OcrMode];

export interface LineItemInfo {
    description: string;
    total: number;
};

export interface TransactionMetadata {
    date: string;
    category: string;
};

export interface OcrResult extends LineItemInfo, TransactionMetadata { }