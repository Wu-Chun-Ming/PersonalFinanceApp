import { CATEGORY_COLORS } from "@/constants/Colors";
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    TransactionCategory,
    TransactionProps,
    TransactionType,
} from "@/constants/Types";
import {
    createTransaction,
    deleteTransaction,
    editTransaction,
    fetchTransaction,
    fetchTransactions,
} from "@/services/transactions";
import {
    getMonthRange,
    getYearRange,
} from "@/utils/dateRanges";
import { router } from "expo-router";
import { useMemo } from "react";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";
import { useFilteredTransactions } from "./useFilteredTransactions";

// Custom hook to fetch transactions
export const useTransactions = () => {
    return useCustomQuery<TransactionProps[]>({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
        fallbackValue: [],
    });
};

// Custom hook to fetch a single transaction
export const useTransaction = (transactionId: number) => {
    return useCustomQuery<TransactionProps | null>({
        queryKey: ['transaction', transactionId],
        queryFn: () => fetchTransaction(Number(transactionId)),
        fallbackValue: null,
        onError: () => router.back(),   // Navigate back if error occurs
        options: {
            enabled: !!transactionId,
        },
    });
};

// Custom hook to create a transaction
export const useCreateTransaction = () => {
    return useCustomMutation({
        mutationFn: (newTransactionData: TransactionProps) => createTransaction(newTransactionData),
        invalidateKeys: () => [['transactions']],       // Invalidate transactions query on success
        onInvalidationComplete: () => router.back(),    // Navigate to previous page after creating transaction
    });
}

// Custom hook to update a transaction
export const useUpdateTransaction = () => {
    return useCustomMutation({
        mutationFn: ({ id, updatedTransactionData }: { id: number, updatedTransactionData: TransactionProps }) => editTransaction(id, updatedTransactionData),
        invalidateKeys: (variables) => [
            ['transaction', variables?.id],
            ['transactions'],   // Invalidate transaction and transactions queries on success
        ],
    });
}

// Custom hook to delete a transaction
export const useDeleteTransaction = () => {
    return useCustomMutation({
        mutationFn: (id: number) => deleteTransaction(id),
        invalidateKeys: () => [['transactions']],       // Invalidate transactions query on success
        onInvalidationComplete: () => router.back(),    // Navigate to previous page after deleting transaction
    });
}

// Custom hook to process transactions data
export const useTransactionData = (
    selectedYear?: number,
    selectedMonth?: number,
) => {
    const { data: transactions = [] } = useTransactions();

    const yearRange = getYearRange(selectedYear);
    const monthRange = getMonthRange(selectedYear, selectedMonth);

    return useMemo(() => {
        const buckets = {
            expenseTransactions: [] as TransactionProps[],
            incomeTransactions: [] as TransactionProps[],
            nonRecurringTransactions: [] as TransactionProps[],
            recurringTransactions: [] as TransactionProps[],
            selectedYearTransactions: [] as TransactionProps[],
            selectedYearExpenseTransactions: [] as TransactionProps[],
            selectedMonthExpenseTransactions: [] as TransactionProps[],
        };

        for (const t of transactions) {
            const isExpense = t.type === TransactionType.EXPENSE;
            const isIncome = t.type === TransactionType.INCOME;
            const isRecurring = t.recurring;
            const isNonRecurring = !isRecurring;

            if (isExpense) buckets.expenseTransactions.push(t);
            if (isIncome) buckets.incomeTransactions.push(t);
            if (isNonRecurring) buckets.nonRecurringTransactions.push(t);
            if (isRecurring) buckets.recurringTransactions.push(t);

            if (isNonRecurring && t.date) {
                const date = new Date(t.date);
                // Transactions in the selected year
                if (
                    yearRange
                    && date >= yearRange.start
                    && date < yearRange.end
                ) {
                    buckets.selectedYearTransactions.push(t);
                    if (isExpense) buckets.selectedYearExpenseTransactions.push(t);
                }

                // Transactions in the selected month
                if (
                    monthRange
                    && date >= monthRange.start
                    && date < monthRange.end
                ) {
                    if (isExpense) buckets.selectedMonthExpenseTransactions.push(t);
                }
            }
        }

        const selectedYearTransactionsData = {
            selectedYearTransactions: buckets.selectedYearTransactions,
            selectedYearExpenseTransactions: buckets.selectedYearExpenseTransactions,
        }
        const selectedMonthTransactionsData = {
            selectedMonthExpenseTransactions: buckets.selectedMonthExpenseTransactions,
        }

        return {
            expenseTransactions: buckets.expenseTransactions,
            incomeTransactions: buckets.incomeTransactions,
            nonRecurringTransactions: buckets.nonRecurringTransactions,
            recurringTransactions: buckets.recurringTransactions,
            ...selectedYearTransactionsData,
            ...selectedMonthTransactionsData,
        };
    }, [transactions, yearRange, monthRange]);
};

export const useTransactionSummary = (transactions: TransactionProps[]) => {
    // Calculate totals for each category
    const totalByCategory = useMemo(() => {
        const totals: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;

        for (const { category, amount } of transactions) {
            totals[category] = (totals[category] ?? 0) + amount;
        }

        return totals;
    }, [transactions]);

    // Calculate grand total
    const grandTotal = useMemo(() => {
        return transactions.reduce((sum, t) => sum + t.amount, 0);
    }, [transactions]);

    // Calculate percentage for each category
    const percentageByCategory = useMemo(() => {
        const percentages: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;
        
        for (const category of Object.keys(totalByCategory) as TransactionCategory[]) {
            percentages[category] = grandTotal ? (totalByCategory[category] / grandTotal) * 100 : 0;
        }
        
        return percentages;
    }, [totalByCategory, grandTotal]);

    return {
        totalByCategory,
        grandTotal,
        percentageByCategory,
    };
};

export const usePieChartTransactions = (
    expenseTransactions: TransactionProps[],
    incomeTransactions: TransactionProps[],
    transactionType: TransactionType,
) => {
    const transactionsByType = (transactionType === TransactionType.EXPENSE) ? expenseTransactions : incomeTransactions;
    const categories = (transactionType === TransactionType.EXPENSE) ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    // Calculate totals by category
    const transactionsPerCategory = useMemo(() => {
        const totalsMap: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;

        // Calculate totals for each category
        for (const { category, amount } of transactionsByType) {
            totalsMap[category] = (totalsMap[category] ?? 0) + amount;
        }

        return categories.map(category => ({
            label: category,
            value: totalsMap[category] ?? 0,
            color: CATEGORY_COLORS[category],
        }));
    }, [transactionsByType, categories]);

    return {
        transactionsPerCategory,
    };
}

export const useIncomeGraphTransactions = (
    incomeTransactions: TransactionProps[],
    incomeGraphMode: 'day' | 'month' | 'year',
) => {
    const now = new Date();

    // Transactions in the selected period for income graph
    // 'day' => current month
    // 'month' => current year
    // 'year' => last 12 years
    const selectedPeriodIncomeTransactions = useFilteredTransactions(incomeTransactions, {
        startDate: incomeGraphMode === 'day' ? new Date(now.getFullYear(), now.getMonth(), 1)       // First day of current month
            : incomeGraphMode === 'month' ? new Date(now.getFullYear(), 0, 1)                       // First day of current year
                : new Date(now.getFullYear() - 11, 0, 1),                                           // First day of year (11 years ago)
        endDate: incomeGraphMode === 'day' ? new Date(now.getFullYear(), now.getMonth() + 1, 0)     // Last day of current month
            : incomeGraphMode === 'month' ? new Date(now.getFullYear() + 1, 0, 0)                   // Last day of current year
                : new Date(now.getFullYear() + 1, 0, 0),                                            // Last day of current year
    });

    return {
        selectedPeriodIncomeTransactions,
    };
}