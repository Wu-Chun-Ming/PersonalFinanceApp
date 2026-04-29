export const AbortReason = {
  TIMEOUT: 'timeout',
  USER_ABORT: 'user_abort',
} as const;

export type AbortReasonType = (typeof AbortReason)[keyof typeof AbortReason];
