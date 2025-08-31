import { useMemo } from 'react';

// Custom import
import { RecurringFrequency, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';

interface FilterParams {
    date?: Date | null;
    startDate?: Date | null;
    endDate?: Date | null;
    type?: TransactionType | string;
    category?: TransactionCategory | string;
    amount?: number | string;
    recurring?: boolean;
    frequency?: RecurringFrequency | string;
}

export const useFilteredTransactions = (
    transactions: TransactionProps[],
    filters: FilterParams,
) => {
    const {
        date,
        startDate,
        endDate,
        type,
        category,
        amount,
        recurring,
        frequency,
    } = filters;

    const filteredTransactions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        return transactions.filter(transaction =>
            (date === undefined || transaction.date === date)
            &&
            (
                transaction.date
                && (!startDate || new Date(transaction.date) >= new Date(startDate))
                && (!endDate || new Date(transaction.date) < new Date(endDate))
            )
            && (!type || transaction.type === type)
            && (!category || transaction.category === category)
            && (!amount || transaction.amount === Number(amount))
            && (!recurring || transaction.recurring === (recurring === 'true'))
            && (!frequency || transaction.recurring_frequency?.frequency === frequency)
        );
    }, [transactions, date, startDate, endDate, type, category, amount, recurring, frequency]);

    return filteredTransactions;
};
