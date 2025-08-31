import { useMemo } from 'react';

// Custom import
import { RecurringFrequency, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';

interface FilterParams {
    date?: Date | null;
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
        type,
        category,
        amount,
        recurring,
        frequency,
    } = filters;

    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction =>
            (!date || transaction.date === new Date(date.toString()))
            && (!type || transaction.type === type)
            && (!category || transaction.category === category)
            && (!amount || transaction.amount === Number(amount))
            && (!recurring || transaction.recurring === (recurring === 'true'))
            && (!frequency || transaction.recurring_frequency?.frequency === frequency)
        );
    }, [transactions, date, type, category, amount, recurring, frequency]);

    return filteredTransactions;
};
