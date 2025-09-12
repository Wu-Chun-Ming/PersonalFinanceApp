import { mockDatabaseTransactions, mockTransactions } from "@/__mocks__/mockData";
import * as databaseModule from "@/db/database";
import { destroyTransaction, getTransactions, showTransaction, storeTransaction, updateTransaction } from "@/db/database";
import { SQLiteDatabase } from "expo-sqlite";

// Mock the database module
jest.mock("@/db/database", () => {
    const actualDatabaseOperations = jest.requireActual('@/db/database');       // Load the real module

    return {
        ...actualDatabaseOperations,
        getDatabaseInstance: jest.fn(),
    }
});

// Tests for transaction operations
describe('Transaction operations', () => {
    let mockedDb: SQLiteDatabase;

    afterAll(() => {
        jest.resetAllMocks();
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const dbInstance = {
            getAllAsync: jest.fn(),
            getFirstAsync: jest.fn(),
            runAsync: jest.fn(),
            execAsync: jest.fn(),
        };
        ((databaseModule as any).getDatabaseInstance as jest.Mock).mockResolvedValue(dbInstance);

        // Get the mocked database instance
        mockedDb = await (databaseModule as any).getDatabaseInstance();
    });

    // Tests for successful transaction operations
    describe("Successful transaction operations", () => {
        test("should fetch transactions successfully", async () => {
            (mockedDb.getAllAsync as jest.Mock).mockResolvedValue(mockDatabaseTransactions);

            const response = await getTransactions(mockedDb);

            expect(mockedDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM transactions");
            expect(response.data).toEqual(mockTransactions);
        });

        test("should fetch non-recurring transaction successfully", async () => {
            (mockedDb.getFirstAsync as jest.Mock).mockResolvedValue(mockDatabaseTransactions[0]);

            const response = await showTransaction(1, mockedDb);

            expect(mockedDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM transactions WHERE id = ?", 1);
            expect(response.data).toEqual(mockTransactions[0]);
        });

        test("should fetch recurring transaction successfully", async () => {
            (mockedDb.getFirstAsync as jest.Mock).mockResolvedValue(mockDatabaseTransactions[1]);

            const response = await showTransaction(2, mockedDb);

            expect(mockedDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM transactions WHERE id = ?", 2);
            expect(response.data).toEqual(mockTransactions[1]);
        });

        test("should store non-recurring transaction successfully", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1, lastInsertRowId: 1 })

            const response = await storeTransaction(mockTransactions[0], mockedDb);

            expect(response.data).toEqual({
                success: true,
                messages: "Transaction created successfully",
            });
        });

        test("should store recurring transaction successfully", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1, lastInsertRowId: 1 })

            const response = await storeTransaction(mockTransactions[1], mockedDb);

            expect(response.data).toEqual({
                success: true,
                messages: "Transaction created successfully",
            });
        });

        test("should update non-recurring transaction successfully", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

            const response = await updateTransaction(mockTransactions[0], 1, mockedDb);

            expect(response.data).toEqual({
                success: true,
                messages: "Transaction updated successfully",
            });
        });

        test("should update recurring transaction successfully", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

            const response = await updateTransaction(mockTransactions[1], 1, mockedDb);

            expect(response.data).toEqual({
                success: true,
                messages: "Transaction updated successfully",
            });
        });

        test("should delete transaction successfully", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

            const response = await destroyTransaction(1, mockedDb);

            expect(response.data).toEqual({
                success: true,
                messages: "Transaction deleted successfully",
            });
        });
    });

    // Tests for failed transaction operations
    describe("Failed transaction operations", () => {
        test("should fail to fetch transactions", async () => {
            (mockedDb.getAllAsync as jest.Mock).mockResolvedValue([]);

            const response = await getTransactions(mockedDb);

            expect(mockedDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM transactions");
            expect(response.data).toEqual(null);
        });

        test("should fail to fetch transaction", async () => {
            (mockedDb.getFirstAsync as jest.Mock).mockResolvedValue(null);

            const response = await showTransaction(1, mockedDb);

            expect(mockedDb.getFirstAsync).toHaveBeenCalledWith("SELECT * FROM transactions WHERE id = ?", 1);
            expect(response.data).toEqual(null);
        });

        test("should fail to store transaction", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 0, lastInsertRowId: 0 })

            const response = await storeTransaction(mockTransactions[0], mockedDb);

            expect(response.data).toEqual({
                success: false,
                messages: 'Failed to create transaction',
            });
        });

        test("should fail to update transaction", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 0 });

            const response = await updateTransaction(mockTransactions[0], 1, mockedDb);

            expect(response.data).toEqual({
                success: false,
                messages: "Failed to update transaction",
            });
        });

        test("should fail to delete transaction", async () => {
            (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 0 });

            const response = await destroyTransaction(1, mockedDb);

            expect(response.data).toEqual({
                success: false,
                messages: "Failed to delete transaction",
            });
        });
    });
});

// Tests for transaction error handling
describe("Transaction error handling", () => {
    let mockedDb: SQLiteDatabase;

    afterAll(() => {
        jest.resetAllMocks();
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const dbInstance = {
            getAllAsync: jest.fn().mockRejectedValue(new Error("Database error")),
            getFirstAsync: jest.fn().mockRejectedValue(new Error("Database error")),
            runAsync: jest.fn().mockRejectedValue(new Error("Database error")),
            execAsync: jest.fn().mockRejectedValue(new Error("Database error")),
        };
        ((databaseModule as any).getDatabaseInstance as jest.Mock).mockResolvedValue(dbInstance);

        mockedDb = await (databaseModule as any).getDatabaseInstance();
    });

    test("should throw error when fetching transactions", async () => {
        await expect(getTransactions(mockedDb))
            .rejects.toThrow("Error fetching data from transactions table: Database error");
    });

    test("should throw error when fetching transaction", async () => {
        await expect(showTransaction(1, mockedDb))
            .rejects.toThrow("Error fetching transaction: Database error");
    });

    test("should throw error when storing transaction", async () => {
        await expect(storeTransaction(mockTransactions[0], mockedDb))
            .rejects.toThrow("Error creating transaction: Database error");
    });

    test("should throw error when updating transaction", async () => {
        await expect(updateTransaction(mockTransactions[0], 1, mockedDb))
            .rejects.toThrow("Error updating transaction: Database error");
    });

    test("should throw error when deleting transaction", async () => {
        await expect(destroyTransaction(1, mockedDb))
            .rejects.toThrow("Error deleting transaction: Database error");
    });
});
