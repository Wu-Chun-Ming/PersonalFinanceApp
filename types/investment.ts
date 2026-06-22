export const CommonInvestmentType = {
  CASH: 'Cash', // No market returns
  CASH_MANAGEMENT: 'Cash Management', // Spendable + earns daily yield
  STOCK: 'Stock',
  BOND: 'Bond',
  ETF: 'ETF',
  MUTUAL_FUND: 'Mutual Fund',
  REIT: 'REIT',
  COMMODITY: 'Commodity',
  CRYPTO: 'Crypto',
} as const;

export const MalaysiaInvestmentType = {
  EPF: 'EPF', // KWSP
  ASNB: 'ASNB', // ASB, ASM, ASM2, ASM3
  FD: 'FD', // Fixed Deposit
  PRS: 'PRS', // Private Retirement Scheme
} as const;

export const InvestmentType = {
  ...CommonInvestmentType,
  ...MalaysiaInvestmentType,
} as const;

export type InvestmentTypeValue =
  (typeof InvestmentType)[keyof typeof InvestmentType];

export interface InvestmentProps {
  id?: number;
  accountId: number;
  name: string;
  type: InvestmentTypeValue;
  value: number;
  currency: string;
  updated_at: string;
}
