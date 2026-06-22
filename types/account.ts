export const AccountType = {
  BANK: 'Bank',
  E_WALLET: 'e-Wallet',
  CASH: 'Cash',
  INVESTMENT: 'Investment',
} as const;

export type AccountTypeValue = (typeof AccountType)[keyof typeof AccountType];

export interface AccountProps {
  id?: number;
  name: string;
  type: AccountTypeValue;
  balance: number;
  currency: string;
  earnReturns: boolean;
  updated_at: string;
}
