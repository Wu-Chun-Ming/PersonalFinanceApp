import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/transaction';
import { TransactionType, TransactionTypeValue } from '@/types';

export function getCategoriesByTransactionType(
  transactionType: TransactionTypeValue,
) {
  return transactionType === TransactionType.EXPENSE
    ? EXPENSE_CATEGORIES
    : INCOME_CATEGORIES;
}
