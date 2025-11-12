import { BudgetProps } from "@/constants/Types";
import { editBudget, fetchBudgets } from "@/services/budgets";
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