import { Frequency, RecurringFrequency, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';
import { useMemo } from 'react';

interface FilterParams {
    date?: Date | string;
    type?: TransactionType | string;
    category?: TransactionCategory | string;
    amount?: number | string;
    recurring?: boolean | string;
    recurringFrequency?: RecurringFrequency | string;
    frequency?: Frequency | string;
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
