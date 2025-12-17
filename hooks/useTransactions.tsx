import { CATEGORY_COLORS } from "@/constants/colors";
import {
    createTransaction,
    deleteTransaction,
    editTransaction,
    fetchTransaction,
    fetchTransactions,
    importTransactions,
} from "@/services/transactionService";
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    TransactionCategoryType,
    TransactionProps,
    TransactionType,
    TransactionTypeValue,
} from "@/types";
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

// Custom hook to import transactions
export const useImportTransactions = () => {
    return useCustomMutation({
        mutationFn: (fileType: 'json' | 'csv') => importTransactions(fileType),
        invalidateKeys: () => [['transactions']],       // Invalidate transactions query on success
    });
}

// Custom hook to process transactions data
export const useTransactionData = (
    transactions: TransactionProps[],
    selectedYear?: number,
    selectedMonth?: number,
) => {
    const yearRange = useMemo(
        () => getYearRange(selectedYear),
        [selectedYear]
    );

    const monthRange = useMemo(
        () => getMonthRange(selectedYear, selectedMonth),
        [selectedYear, selectedMonth]
    );

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

// Custom hook to summarize transaction data
export const useTransactionSummary = (transactions: TransactionProps[]) => {
    // Calculate transaction totals per category and month, grand total
    const {
        totalsPerCategory,
        totalsPerMonth,
        grandTotal,
    } = useMemo(() => {
        const totalsPerCategory: Record<TransactionCategoryType, number> = {} as Record<TransactionCategoryType, number>;
        // Initialize fixed-size arrays
        const income: number[] = Array(12).fill(0);
        const expense: number[] = Array(12).fill(0);
        let grandTotal = 0;

        for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            const month = new Date(t.date).getMonth(); // 0–11 index
            const category = t.category;
            const amount = t.amount;

            if (t.type === TransactionType.INCOME) {
                income[month] += amount;
            } else {
                expense[month] += amount;
            }

            totalsPerCategory[category] = (totalsPerCategory[category] ?? 0) + amount;
            grandTotal += amount;
        }

        const totalsPerMonth = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            incomePerMonth: income[i],
            expensePerMonth: expense[i],
        }));

        return {
            totalsPerCategory,
            totalsPerMonth,
            grandTotal,
        };
    }, [transactions]);

    // Calculate percentage for each category
    const percentagesPerCategory = useMemo(() => {
        const percentages: Record<TransactionCategoryType, number> = {} as Record<TransactionCategoryType, number>;

        for (const category of Object.keys(totalsPerCategory) as TransactionCategoryType[]) {
            percentages[category] = grandTotal ? (totalsPerCategory[category] / grandTotal) * 100 : 0;
        }

        return percentages;
    }, [totalsPerCategory, grandTotal]);

    return {
        transactionTotalsPerCategory: totalsPerCategory,
        transactionTotalsPerMonth: totalsPerMonth,
        grandTotal,
        percentagesPerCategory,
    };
};

export const usePieChartTransactions = (
    transactions: TransactionProps[],
    transactionType: TransactionTypeValue,
) => {
    const categories = (transactionType === TransactionType.EXPENSE) ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const { transactionTotalsPerCategory } = useTransactionSummary(transactions);

    // Calculate totals by category
    const transactionsPerCategory = useMemo(() => {
        return categories.map(category => ({
            label: category,
            value: transactionTotalsPerCategory[category] ?? 0,
            color: CATEGORY_COLORS[category],
        }));
    }, [transactionTotalsPerCategory, categories]);

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