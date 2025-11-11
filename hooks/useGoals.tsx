import { IncomeGoalProps, SavingsGoalProps } from "@/constants/Types";
import { editGoal, fetchGoal } from "@/db/goals";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";

// Custom hook to fetch goals
export const useGoals = () => {
    return useCustomQuery<{
        savings: Partial<SavingsGoalProps>,
        income: Partial<IncomeGoalProps>,
    }>({
        queryKey: ['goals'],
        queryFn: async () => {
            return {
                savings: await fetchGoal('savings'),
                income: await fetchGoal('income'),
            };
        },
        fallbackValue: {
            savings: {
                date: undefined,
                amount: undefined,
            },
            income: {
                perDay: undefined,
                perMonth: undefined,
                perYear: undefined,
            },
        }
    });
};

// Custom hook to update a goal
export const useUpdateGoal = () => {
    return useCustomMutation({
        mutationFn: (updatedGoalsData: { savings: SavingsGoalProps, income: IncomeGoalProps }) => editGoal(updatedGoalsData),
        invalidateKeys: () => [['goals']],    // Invalidate goals query on success
    });
}