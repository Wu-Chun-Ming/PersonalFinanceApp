import {
    mockDefaultGoals,
    mockGoals,
} from "@/__mocks__/mockData";
import {
    editGoal,
    fetchGoal,
    resetGoal,
} from "@/services/goals";
import dayjs from "dayjs";
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore library
jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

// Tests for goal operations
describe('Goal operations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch savings goal successfully', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockGoals.savings.date.toISOString());
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockGoals.savings.amount.toString());

        const result = await fetchGoal('savings');

        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('savingsGoalDate');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('savingsGoalAmount');
        expect(result).toEqual(mockGoals.savings);
    });

    test('should returns default savings goal', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await fetchGoal('savings');

        expect(result).toEqual(mockDefaultGoals.savings);
    });

    test('should fetch income goals successfully', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockGoals.income.perDay.toString());
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockGoals.income.perMonth.toString());
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(mockGoals.income.perYear.toString());

        const result = await fetchGoal('income');

        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('incomeGoalPerDay');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('incomeGoalPerMonth');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith('incomeGoalPerYear');
        expect(result).toEqual(mockGoals.income);
    });

    test('should returns default income goals', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(undefined);
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(undefined);

        const result = await fetchGoal('income');

        expect(result).toEqual(mockDefaultGoals.income);
    });

    test('should update goals successfully', async () => {
        const result = await editGoal(mockGoals);

        expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(1, 'savingsGoalDate', dayjs(mockGoals.savings.date).format('YYYY-MM-DD'));
        expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(2, 'savingsGoalAmount', mockGoals.savings.amount.toString());
        expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(3, 'incomeGoalPerDay', mockGoals.income.perDay.toString());
        expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(4, 'incomeGoalPerMonth', mockGoals.income.perMonth.toString());
        expect(SecureStore.setItemAsync).toHaveBeenNthCalledWith(5, 'incomeGoalPerYear', mockGoals.income.perYear.toString());

        expect(result).toEqual({
            success: true,
            messages: "Goals updated successfully",
        });
    });

    test('should reset savings goal successfully', async () => {
        const result = await resetGoal('savings');
        expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(1, 'savingsGoalDate');
        expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(2, 'savingsGoalAmount');
        expect(result).toEqual({
            success: true,
            messages: "Goals reset successfully",
        });
    });

    test('should reset income goals successfully', async () => {
        const result = await resetGoal('income');
        expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(1, 'incomeGoalPerDay');
        expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(2, 'incomeGoalPerMonth');
        expect(SecureStore.deleteItemAsync).toHaveBeenNthCalledWith(3, 'incomeGoalPerYear');
        expect(result).toEqual({
            success: true,
            messages: "Goals reset successfully",
        });
    });
});

// Tests for goal error handling
describe("Goal error handling", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw error when fetching invalid goal', async () => {
        await expect(fetchGoal('invalid' as any)).rejects.toThrow('Invalid goal type');
    });

    test('should throw error when resetting invalid goal', async () => {
        await expect(resetGoal('invalid' as any)).rejects.toThrow('Invalid goal type');
    });

    test('should throw error when fetching goal', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('SecureStore error'));

        await expect(fetchGoal('savings')).rejects.toThrow('SecureStore error');
    });

    test('should throw error when editing goal', async () => {
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('SecureStore error'));

        await expect(editGoal(mockGoals)).rejects.toThrow('Error updating goal: SecureStore error');
    });
});