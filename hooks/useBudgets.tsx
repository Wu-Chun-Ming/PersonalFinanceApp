import { BudgetProps, TransactionCategory } from "@/constants/Types";
import { editBudget, fetchBudgets } from "@/services/budgetService";
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
    selectedYear: number,
    selectedMonth?: number,
) => {
    return useMemo(() => {
        const buckets = {
            selectedYearBudgets: [] as BudgetProps[],
            selectedMonthBudgets: [] as BudgetProps[],
        };

        for (const b of budgets) {
            const isSelectedYear = b.year === selectedYear;
            const isSelectedMonth = b.year === selectedYear && b.month === selectedMonth;

            if (isSelectedYear) buckets.selectedYearBudgets.push(b);
            if (isSelectedMonth) buckets.selectedMonthBudgets.push(b);
        }

        return {
            selectedYearBudgets: buckets.selectedYearBudgets,
            selectedMonthBudgets: buckets.selectedMonthBudgets,
        };
    }, [budgets, selectedYear, selectedMonth]);
};

// Custom hook to summarize budget data
export const useBudgetSummary = (
    selectedYearBudgets: BudgetProps[],
) => {
    // Calculate budget totals per category and month
    return useMemo(() => {
        const totalsPerCategory: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;
        const monthTotals: number[] = Array(12).fill(0);

        for (const { month, category, amount } of selectedYearBudgets) {        // 1-12 indexed months
            totalsPerCategory[category] = (totalsPerCategory[category] ?? 0) + amount;
            monthTotals[month - 1] = (monthTotals[month - 1] ?? 0) + amount;
        }

        const totalsPerMonth = monthTotals.map((budgetPerMonth, i) => ({
            month: i + 1,
            budgetPerMonth,
        }));

        return {
            budgetTotalsPerCategory: totalsPerCategory,
            budgetTotalsPerMonth: totalsPerMonth,
        };
    }, [selectedYearBudgets]);
};
