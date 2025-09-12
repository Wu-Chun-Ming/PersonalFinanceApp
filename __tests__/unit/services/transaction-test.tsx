import { mockTransactions } from "@/__mocks__/mockData";
import { destroyTransaction, getTransactions, showTransaction, storeTransaction, updateTransaction } from "@/db/database";
import { createTransaction, deleteTransaction, editTransaction, fetchTransaction, fetchTransactions } from "@/db/transactions";

// Mock the database module
jest.mock("@/db/database", () => ({
    getTransactions: jest.fn(),
    showTransaction: jest.fn(),
    storeTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    destroyTransaction: jest.fn(),
}));

test('should returns response.data when fetching transactions', async () => {
    (getTransactions as jest.Mock).mockResolvedValue({ data: mockTransactions });

    const result = await fetchTransactions();

    expect(getTransactions).toHaveBeenCalled();
    expect(result).toHaveLength(mockTransactions.length);
    expect(result).toEqual(mockTransactions);
});

test('should returns response.data when fetching transaction', async () => {
    (showTransaction as jest.Mock).mockResolvedValue({ data: mockTransactions[0] });

    const result = await fetchTransaction(1);

    expect(showTransaction).toHaveBeenCalled();
    expect(result).toEqual(mockTransactions[0]);
});

test('should returns response.data when creating transaction', async () => {
    const response = {
        success: true,
        messages: "Transaction created successfully",
    };
    (storeTransaction as jest.Mock).mockResolvedValue({ data: response });

    const result = await createTransaction(mockTransactions[0]);

    expect(storeTransaction).toHaveBeenCalled();
    expect(result).toEqual(response);
});

test('should returns response.data when updating transaction', async () => {
    const response = {
        success: true,
        messages: "Transaction updated successfully",
    };
    (updateTransaction as jest.Mock).mockResolvedValue({ data: response });

    const result = await editTransaction(1, mockTransactions[0]);

    expect(updateTransaction).toHaveBeenCalled();
    expect(result).toEqual(response);
});

test('should returns response.data when deleting transaction', async () => {
    const response = {
        success: true,
        messages: "Transaction deleted successfully",
    };
    (destroyTransaction as jest.Mock).mockResolvedValue({ data: response });

    const result = await deleteTransaction(1);

    expect(destroyTransaction).toHaveBeenCalled();
    expect(result).toEqual(response);
});