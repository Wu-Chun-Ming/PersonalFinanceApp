import { mockBudgets } from "@/__mocks__/mockData";
import * as databaseModule from "@/db/database";
import { getBudgets, updateBudget } from "@/db/database";
import { SQLiteDatabase } from "expo-sqlite";

// Mock the database module
jest.mock("@/db/database", () => {
    const actualDatabaseOperations = jest.requireActual('@/db/database');       // Load the real module

    return {
        ...actualDatabaseOperations,
        getDatabaseInstance: jest.fn(),
    }
});

// Tests for budget operations
describe('Budget operations', () => {
    let mockedDb: SQLiteDatabase;

    afterAll(() => {
        jest.resetAllMocks();
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const dbInstance = {
            getAllAsync: jest.fn(),
            runAsync: jest.fn(),
        };
        ((databaseModule as any).getDatabaseInstance as jest.Mock).mockResolvedValue(dbInstance);

        // Get the mocked database instance
        mockedDb = await (databaseModule as any).getDatabaseInstance();
    });

    test("should fetch budgets successfully", async () => {
        // Mock the getAllAsync method to return mock budgets
        (mockedDb.getAllAsync as jest.Mock).mockResolvedValue(mockBudgets);

        const response = await getBudgets(mockedDb);

        expect(mockedDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM budgets");
        expect(response.data).toEqual(mockBudgets);
    });

    test("should fail to fetch budgets", async () => {
        // Mock the getAllAsync method to return an empty array
        (mockedDb.getAllAsync as jest.Mock).mockResolvedValue([]);

        const response = await getBudgets(mockedDb);

        expect(mockedDb.getAllAsync).toHaveBeenCalledWith("SELECT * FROM budgets");
        expect(response.data).toEqual([]);
    });

    test("should update budget successfully", async () => {
        // Mock the runAsync method to simulate successful update
        (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 1 });

        const response = await updateBudget(mockBudgets[0].amount, {
            year: mockBudgets[0].year,
            month: mockBudgets[0].month,
            category: mockBudgets[0].category,
        }, mockedDb);

        expect(response.data).toEqual({
            success: true,
            messages: "Budget updated successfully",
        });
    });

    test("should fail to update budget", async () => {
        // Mock the runAsync method to simulate failed update
        (mockedDb.runAsync as jest.Mock).mockResolvedValue({ changes: 0 });

        const response = await updateBudget(mockBudgets[0].amount, {
            year: mockBudgets[0].year,
            month: mockBudgets[0].month,
            category: mockBudgets[0].category,
        }, mockedDb);

        expect(response.data).toEqual({
            success: false,
            messages: "Failed to update budget",
        });
    });
});

// Tests for budget error handling
describe("Budget error handling", () => {
    let mockedDb: SQLiteDatabase;

    afterAll(() => {
        jest.resetAllMocks();
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        const dbInstance = {
            getAllAsync: jest.fn().mockRejectedValue(new Error("Database error")),
            runAsync: jest.fn().mockRejectedValue(new Error("Database error")),
        };
        ((databaseModule as any).getDatabaseInstance as jest.Mock).mockResolvedValue(dbInstance);

        mockedDb = await (databaseModule as any).getDatabaseInstance();
    });

    test("should throw error when fetching budgets", async () => {
        await expect(getBudgets(mockedDb)).rejects.toThrow("Error fetching data from budgets table: Database error");
    });

    test("should throw error when updating budget", async () => {
        await expect(updateBudget(mockBudgets[0].amount, {
            year: mockBudgets[0].year,
            month: mockBudgets[0].month,
            category: mockBudgets[0].category,
        }, mockedDb))
            .rejects.toThrow("Error updating budget: Database error");
    });
});
