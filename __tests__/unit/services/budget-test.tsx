import { mockBudgets } from "@/__mocks__/mockData";
import { getBudgets, updateBudget } from "@/database/budgetDatabase";
import { editBudget, fetchBudgets } from "@/services/budgets";

jest.mock("@/database/budgetDatabase", () => ({
    getBudgets: jest.fn(),
    updateBudget: jest.fn(),
}));

test('should returns response.data when fetching budgets', async () => {
    (getBudgets as jest.Mock).mockResolvedValue({ data: mockBudgets });

    const result = await fetchBudgets();

    expect(getBudgets).toHaveBeenCalled();
    expect(result).toHaveLength(mockBudgets.length);
    expect(result).toEqual(mockBudgets);
});

test('should returns response.data when updating budget', async () => {
    const response = {
        success: true,
        messages: "Budget updated successfully",
    };
    (updateBudget as jest.Mock).mockResolvedValue({ data: response });

    const result = await editBudget(1, mockBudgets[0]);

    expect(updateBudget).toHaveBeenCalled();
    expect(result).toEqual(response);
});