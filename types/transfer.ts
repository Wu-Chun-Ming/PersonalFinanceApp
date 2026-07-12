export interface TransferProps {
  id?: number;
  date: Date;
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description: string;
  currency: string;
}
