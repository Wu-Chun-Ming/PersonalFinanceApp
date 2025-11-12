import { mockTransactions } from "@/__mocks__/mockData";
import { RecurringFrequency, TransactionCategory, TransactionProps, TransactionType } from "@/constants/Types";
import { useFilteredTransactions } from "@/hooks/useFilteredTransactions";
import { fetchTransactions } from "@/services/transactions";
import { renderHook } from '@testing-library/react-native';

// Mock the database functions
jest.mock("@/services/transactions", () => ({
    fetchTransactions: jest.fn(),
}));

// Tests for useFilteredTransactions
describe('useFilteredTransactions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (fetchTransactions as jest.Mock).mockResolvedValue(mockTransactions);
    });

    test("should returns only transactions matching the exact date", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            date: '2025-01-01',
        }));

        expect(filtered.current).toHaveLength(1);
        expect(filtered.current).toEqual([
            mockTransactions[0],
        ]);

        filtered.current.forEach(item => {
            expect(item.date?.getTime()).toBe(new Date('2025-01-01').getTime());
        });
    });

    test("should returns only transactions within the date range", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            startDate: '2024-12-31',
            endDate: '2025-01-03',
        }));

        expect(filtered.current).toHaveLength(2);
        expect(filtered.current).toEqual([
            mockTransactions[0],
            mockTransactions[3],
        ]);

        filtered.current.forEach(item => {
            const transactionDate = new Date(item.date).getTime();
            const startDate = new Date('2024-12-31').getTime();
            const endDate = new Date('2025-01-03').getTime();

            expect(transactionDate).toBeGreaterThanOrEqual(startDate);
            expect(transactionDate).toBeLessThanOrEqual(endDate);
        });
    });

    test("should returns only transactions matching the type", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            type: TransactionType.INCOME,
        }));

        expect(filtered.current).toHaveLength(2);
        filtered.current.forEach(item => {
            expect(item.type).toBe(TransactionType.INCOME);
        });
    });

    test("should returns only transactions matching the category", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            category: TransactionCategory.TRANSPORTATION,
        }));

        expect(filtered.current).toHaveLength(2);
        filtered.current.forEach(item => {
            expect(item.category).toBe(TransactionCategory.TRANSPORTATION);
        });
    });

    test("should returns only transactions matching the amount", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            amount: 200,
        }));

        expect(filtered.current).toHaveLength(2);
        filtered.current.forEach(item => {
            expect(item.amount).toBe(200);
        });
    });

    test("should returns only transactions matching the amount range", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            minAmount: 100,
            maxAmount: 500,
        }));

        expect(filtered.current).toHaveLength(3);
        filtered.current.forEach(item => {
            expect(item.amount).toBeGreaterThanOrEqual(100);    // Ensure amount is >= 100
            expect(item.amount).toBeLessThan(500);              // Ensure amount is < 500
        });
    });

    test("should returns only recurring transactions when recurring is true", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions as TransactionProps[], {
            recurring: true,
        }));

        expect(filtered.current).toHaveLength(2);
        filtered.current.forEach(item => {
            expect(item.recurring).toBe(true);
        });
    });

    test("should returns only transactions matching the recurring frequency", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            frequency: RecurringFrequency.MONTHLY,
        }));

        expect(filtered.current).toHaveLength(1);
        filtered.current.forEach(item => {
            expect(item.recurring_frequency?.frequency).toBe(RecurringFrequency.MONTHLY);
        })
    });

    test("should returns all transactions when no filters are applied", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {}));

        expect(filtered.current).toEqual(mockTransactions);
    });

    test("should returns empty array when empty transactions array is provided", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions([], {
            date: '2025-01-01',
        }));

        expect(filtered.current).toEqual([]);
    });

    test("should returns empty array when no matching transactions are found", async () => {
        const { result: filtered } = renderHook(() => useFilteredTransactions(mockTransactions, {
            date: '2027-01-01',
        }));

        expect(filtered.current).toEqual([]);
    });
});