import { IncomeGoalProps, SavingsGoalProps } from '@/constants/Types';
import * as SecureStore from 'expo-secure-store';

// Fetch single goal
export const fetchGoal = async (type: 'savings' | 'income') => {
    if (type == 'savings') {        // Savings goal
        const savingsGoalDate = await SecureStore.getItemAsync('savingsGoalDate');
        const savingsGoalAmount = await SecureStore.getItemAsync('savingsGoalAmount');

        return {
            date: savingsGoalDate,
            amount: savingsGoalAmount,
        }
    } else if (type == 'income') {      // Income goals
        const incomeGoalPerDay = await SecureStore.getItemAsync('incomeGoalPerDay');
        const incomeGoalPerMonth = await SecureStore.getItemAsync('incomeGoalPerMonth');
        const incomeGoalPerYear = await SecureStore.getItemAsync('incomeGoalPerYear');

        return {
            perDay: incomeGoalPerDay,
            perMonth: incomeGoalPerMonth,
            perYear: incomeGoalPerYear,
        }
    } else {
        throw new Error('Invalid goal type');
    }
};

// Edit goal
export const editGoal = async (updatedGoalsData: {
    savings: SavingsGoalProps
    income: IncomeGoalProps
}) => {
    try {
        if (updatedGoalsData.savings) {
            await SecureStore.setItemAsync('savingsGoalDate', updatedGoalsData.savings.date.toString());
            await SecureStore.setItemAsync('savingsGoalAmount', updatedGoalsData.savings.amount.toString());
        }
        if (updatedGoalsData.income) {
            await SecureStore.setItemAsync('incomeGoalPerDay', updatedGoalsData.income.perDay.toString());
            await SecureStore.setItemAsync('incomeGoalPerMonth', updatedGoalsData.income.perMonth.toString());
            await SecureStore.setItemAsync('incomeGoalPerYear', updatedGoalsData.income.perYear.toString());
        }

        return {
            data: {
                success: true,
                messages: 'Goals updated successfully',
            }
        };
    } catch (error) {
        throw new Error(`Error updating budget: ${error}`);
    }
};
