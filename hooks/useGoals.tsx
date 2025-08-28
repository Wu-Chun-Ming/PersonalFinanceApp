import { IncomeGoalProps, SavingsGoalProps } from "@/constants/Types";
import { editGoal, fetchGoal } from "@/db/goals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useShowToast from "./useShowToast";

// Custom hook to fetch goals
export const useGoals = () => {
    return useQuery({
        queryKey: ['goals'],
        queryFn: async () => {
            try {
                return {
                    savings: await fetchGoal('savings'),
                    income: await fetchGoal('income'),
                }
            } catch (error) {
                console.error(error);
                return {
                    savings: {
                        date: null,
                        amount: null,
                    },
                    income: {
                        perDay: null,
                        perMonth: null,
                        perYear: null,
                    },
                };
            }
        }
    });
};

// Custom hook to update a goal
export const useUpdateGoal = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();

    return useMutation({
        mutationFn: (updatedGoalsData: { savings: SavingsGoalProps, income: IncomeGoalProps }) => editGoal(updatedGoalsData),
        onSuccess: (response) => {
            const { success, messages } = response.data;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['goals'] });
            }
        },
    });
}