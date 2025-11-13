import { BudgetProps, TransactionProps } from "@/constants/Types";
import { editBudget, fetchBudgets } from "@/services/budgets";
import { useMemo } from "react";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";

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
    selectedYearExpenseTransactions: TransactionProps[],
    selectedMonthExpenseTransactions: TransactionProps[],
    selectedYear: number,
    selectedMonth: number
) => {
    const selectedMonthBudgets = (budgets).filter(b => b.year === selectedYear && b.month === selectedMonth);
    // Calculate total expenses per category for the selected month
    const expenseTotalsByCategory = useMemo(() =>
        selectedMonthExpenseTransactions.reduce<Record<string, number>>((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {}), [selectedMonthExpenseTransactions]
    );
    // Calculate budget by category for the selected month
    const budgetByCategory = useMemo(() =>
        selectedMonthBudgets.reduce<Record<string, BudgetProps>>((acc, b) => {
            acc[b.category] = b;
            return acc;
        }, {}), [selectedMonthBudgets]
    );

    const selectedYearBudgets = (budgets).filter(b => b.year === selectedYear);
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
        selectedYearBudgets,
        selectedMonthBudgets,
        expenseTotalsByCategory,
        budgetByCategory,
        expensesAndBudgetsByMonth: expensesAndBudgetsByMonth(selectedYearExpenseTransactions, selectedYearBudgets),
    };
};
