import { useMemo } from 'react';

// Custom import
import {
  RecurringFrequency,
  TransactionCategoryType,
  TransactionProps,
  TransactionTypeValue,
} from '@/types';

interface FilterParams {
  date?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
  type?: TransactionTypeValue | string;
  category?: TransactionCategoryType | string;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  recurring?: boolean;
  frequency?: RecurringFrequency | string;
}

export const useFilteredTransactions = (
  transactions: TransactionProps[],
  filters: FilterParams,
) => {
  const filteredTransactions = useMemo(() => {
    return filterTransactions(transactions, filters);
  }, [transactions, filters]);

  return filteredTransactions;
};

export const filterTransactions = (
  transactions: TransactionProps[],
  filters: FilterParams,
): TransactionProps[] => {
  const {
    date,
    startDate,
    endDate,
    type,
    category,
    amount,
    minAmount,
    maxAmount,
    recurring,
    frequency,
  } = filters;

  if (!transactions || transactions.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return transactions;

  const dateObj = date ? new Date(date).getTime() : undefined;
  const startDateObj = startDate ? new Date(startDate) : undefined;
  const endDateObj = endDate ? new Date(endDate) : undefined;

  return transactions.filter((transaction) => {
    const tDate = new Date(transaction.date);
    return (
      (!date || tDate.getTime() === dateObj) &&
      (!startDate || tDate >= startDateObj!) &&
      (!endDate || tDate < endDateObj!) &&
      (!type || transaction.type === type) &&
      (!category || transaction.category === category) &&
      (!amount || transaction.amount === amount) &&
      (!minAmount || transaction.amount >= minAmount) &&
      (!maxAmount || transaction.amount < maxAmount) &&
      (recurring === undefined || transaction.recurring === recurring) &&
      (!frequency || transaction.recurring_frequency?.frequency === frequency)
    );
  });
};
