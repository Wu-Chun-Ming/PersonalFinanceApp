import { IncomeGoalProps, SavingsGoalProps } from '@/constants/Types';
import * as SecureStore from 'expo-secure-store';

// Fetch single goal
export const fetchGoal = async (type: 'savings' | 'income') => {
    if (type == 'savings') {        // Savings goal
        const savingsGoalDateStr = await SecureStore.getItemAsync('savingsGoalDate');
        const savingsGoalAmountStr = await SecureStore.getItemAsync('savingsGoalAmount');

        const date = savingsGoalDateStr ? new Date(savingsGoalDateStr) : null;
        const amount = savingsGoalAmountStr ? parseFloat(savingsGoalAmountStr) : null;

        return {
            date,
            amount,
        }
    } else if (type == 'income') {      // Income goals
        const incomeGoalPerDayStr = await SecureStore.getItemAsync('incomeGoalPerDay');
        const incomeGoalPerMonthStr = await SecureStore.getItemAsync('incomeGoalPerMonth');
        const incomeGoalPerYearStr = await SecureStore.getItemAsync('incomeGoalPerYear');

        const perDay = incomeGoalPerDayStr ? parseFloat(incomeGoalPerDayStr) : null;
        const perMonth = incomeGoalPerMonthStr ? parseFloat(incomeGoalPerMonthStr) : null;
        const perYear = incomeGoalPerYearStr ? parseFloat(incomeGoalPerYearStr) : null;

        return {
            perDay,
            perMonth,
            perYear,
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
