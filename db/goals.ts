import { IncomeGoalProps, SavingsGoalProps } from '@/constants/Types';
import dayjs from 'dayjs';
import * as SecureStore from 'expo-secure-store';

/* 
SecureStore Keys: goals
============================================================
Key (Item Name)         Intended Type
------------------------------------------------------------
savingsGoalDate         string (format: 'YYYY-MM-DD')
savingsGoalAmount       number

incomeGoalPerDay        number
incomeGoalPerMonth      number
incomeGoalPerYear       number
============================================================
*/

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
            if (updatedGoalsData.savings.date && !isNaN(Date.parse(updatedGoalsData.savings.date.toString()))) {
                await SecureStore.setItemAsync('savingsGoalDate', dayjs(updatedGoalsData.savings.date).format('YYYY-MM-DD'));
            }
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
        throw new Error(`Error updating goal: ${(error as Error).message}`);
    }
};

// Reset Goal
export const resetGoal = async (type: 'savings' | 'income') => {
    // try {
    if (type === 'savings') {           // Savings goal           
        await SecureStore.deleteItemAsync('savingsGoalDate');
        await SecureStore.deleteItemAsync('savingsGoalAmount');
    } else if (type === 'income') {      // Income goals
        await SecureStore.deleteItemAsync('incomeGoalPerDay');
        await SecureStore.deleteItemAsync('incomeGoalPerMonth');
        await SecureStore.deleteItemAsync('incomeGoalPerYear');
    } else {
        throw new Error('Invalid goal type');
    }

    return {
        data: {
            success: true,
            messages: 'Goals reset successfully',
        }
    }
};
