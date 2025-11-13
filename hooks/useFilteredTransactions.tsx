import { useMemo } from 'react';

// Custom import
import { RecurringFrequency, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';

interface FilterParams {
    date?: Date | string;
    startDate?: Date | string;
    endDate?: Date | string;
    type?: TransactionType | string;
    category?: TransactionCategory | string;
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

    const filteredTransactions = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        const dateObj = date ? new Date(date).getTime() : undefined;
        const startDateObj = startDate ? new Date(startDate) : undefined;
        const endDateObj = endDate ? new Date(endDate) : undefined;

        return transactions.filter(transaction => {
            const tDate = new Date(transaction.date);
            return (!date || tDate.getTime() === dateObj)
                &&
                (
                    (!startDate || tDate >= startDateObj!)
                    && (!endDate || tDate < endDateObj!)
                )
                && (!type || transaction.type === type)
                && (!category || transaction.category === category)
                && (!amount || transaction.amount === amount)
                &&
                (
                    (!minAmount || transaction.amount >= minAmount)
                    && (!maxAmount || transaction.amount < maxAmount)
                )
                && (recurring === undefined || transaction.recurring === recurring)
                && (!frequency || transaction.recurring_frequency?.frequency === frequency)
        });
    }, [transactions, date, startDate, endDate, type, category, amount, minAmount, maxAmount, recurring, frequency]);

    return filteredTransactions;
};
