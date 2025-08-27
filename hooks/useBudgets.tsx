import { BudgetProps } from "@/constants/Types";
import { editBudget, fetchBudgets } from "@/db/budgets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useShowToast from "./useShowToast";

// Custom hook to fetch budgets
export const useBudgets = () => {
    return useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            try {
                return await fetchBudgets();
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    });
};

// Custom hook to update a budget
export const useUpdateBudget = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();

    return useMutation({
        mutationFn: ({ year, month, category, amount }: BudgetProps) => editBudget(amount, { year, month, category }),
        onSuccess: (response) => {
            const { success, messages } = response;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error, _variables) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['budgets'] });
            }
        },
    });
}