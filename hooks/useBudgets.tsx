import { BudgetProps, TransactionProps, TransactionType } from "@/constants/Types";
import { editBudget, fetchBudgets } from "@/services/budgets";
import { useMemo } from "react";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";
import { useFilteredTransactions } from "./useFilteredTransactions";

// Custom hook to fetch budgets
export const useBudgets = () => {
    return useCustomQuery<BudgetProps[]>({
        queryKey: ['budgets'],
        queryFn: fetchBudgets,
        fallbackValue: [],
    });
};

// Custom hook to update a budget
export const useUpdateBudget = () => {
    return useCustomMutation({
        mutationFn: ({ year, month, category, amount }: BudgetProps) => editBudget(amount, { year, month, category }),
        invalidateKeys: () => [['budgets']],    // Invalidate budgets query on success
    });
}

// Custom hook to process budget data
export const useBudgetData = (
    budgets: BudgetProps[],
    transactions: TransactionProps[],
    selectedYear: number,
    selectedMonth: number
) => {
    const selectedYearExpenseTransactions = useFilteredTransactions(transactions, {
        type: TransactionType.EXPENSE,
        recurring: false,
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear, 11, 31),
    });

    const selectedMonthExpenseTransactions = useFilteredTransactions(transactions, {
        type: TransactionType.EXPENSE,
        recurring: false,
        startDate: new Date(selectedYear, selectedMonth - 1, 1),
        endDate: new Date(selectedYear, selectedMonth, 0),
    });

    const selectedYearBudgets = (budgets).filter(b => b.year === selectedYear);
    const selectedMonthBudgets = (budgets).filter(b => b.year === selectedYear && b.month === selectedMonth);

    const expenseTotalsByCategory = useMemo(() =>
        selectedMonthExpenseTransactions.reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {}), [selectedMonthExpenseTransactions]
    );

    const budgetByCategory = useMemo(() =>
        selectedMonthBudgets.reduce<Record<string, BudgetProps>>((acc, b) => {
            acc[b.category] = b;
            return acc;
        }, {}), [selectedMonthBudgets]
    );

    // Calculate total expenses and budgets per month for the selected year
    const expensesAndBudgetsByMonth = (
        selectedYearExpenseTransactions: TransactionProps[],
        selectedYearBudgets: BudgetProps[],
    ) => {
        const expenseTotalByMonth = selectedYearExpenseTransactions.reduce<Record<number, number>>((acc, t) => {
            const month = new Date(t.date).getMonth() + 1;
            acc[month] = (acc[month] || 0) + t.amount;      // Add transaction amount to the respective month
            return acc;
        }, {});

        const budgetTotalByMonth = selectedYearBudgets.reduce<Record<number, number>>((acc, b) => {
            const month = b.month;
            acc[month] = (acc[month] || 0) + b.amount;      // Add budget amount to the respective month
            return acc;
        }, {});

        const months_num = Array.from({ length: 12 }, (_, i) => i + 1);
        const expensesAndBudgetsByMonth = months_num.map((month) => ({
            month: month,
            expensePerMonth: expenseTotalByMonth[month] || 0,
            budgetPerMonth: budgetTotalByMonth[month] || 0,
        }));

        return expensesAndBudgetsByMonth;
    }

    return {
        selectedYearExpenseTransactions,
        selectedMonthExpenseTransactions,
        selectedYearBudgets,
        selectedMonthBudgets,
        expenseTotalsByCategory,
        budgetByCategory,
        expensesAndBudgetsByMonth: expensesAndBudgetsByMonth(selectedYearExpenseTransactions, selectedYearBudgets),
    };
};
