import { renderHook } from '@testing-library/react-native';

import { mockTransactions } from '@/__mocks__/mockData';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { fetchTransactions } from '@/services/transactionService';
import {
  RecurringFrequency,
  TransactionCategory,
  TransactionProps,
  TransactionType,
} from '@/types';

// Mock the database functions
jest.mock('@/services/transactionService', () => ({
  fetchTransactions: jest.fn(),
}));

// Tests for useFilteredTransactions
describe('useFilteredTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetchTransactions as jest.Mock).mockResolvedValue(mockTransactions);
  });

  test('should returns only transactions matching the exact date', async () => {
    const dateToFilter = '2025-01-01';
    const dateObj = new Date(dateToFilter).getTime();
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        date: dateToFilter,
      }),
    );

    expect(filtered.current).toHaveLength(1);
    expect(filtered.current).toEqual([mockTransactions[0]]);

    filtered.current.forEach((item) => {
      expect(item.date).not.toBeNull();
      expect(item.date?.getTime()).toBe(dateObj);
    });
  });

  test('should returns only transactions within the date range', async () => {
    const startDate = '2024-12-31';
    const endDate = '2025-01-03';
    const startDateObj = new Date(startDate).getTime();
    const endDateObj = new Date(endDate).getTime();

    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        startDate: startDate,
        endDate: endDate,
      }),
    );

    expect(filtered.current).toHaveLength(2);
    expect(filtered.current).toEqual([
      mockTransactions[0],
      mockTransactions[3],
    ]);

    filtered.current.forEach((item) => {
      expect(item.date).not.toBeNull();
      const transactionDate = item.date!.getTime();
      expect(transactionDate).toBeGreaterThanOrEqual(startDateObj);
      expect(transactionDate).toBeLessThanOrEqual(endDateObj);
    });
  });

  test('should returns only transactions matching the type', async () => {
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        type: TransactionType.INCOME,
      }),
    );

    expect(filtered.current).toHaveLength(2);
    expect(
      filtered.current.every((item) => item.type === TransactionType.INCOME),
    ).toBe(true);
  });

  test('should returns only transactions matching the category', async () => {
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        category: TransactionCategory.TRANSPORTATION,
      }),
    );

    expect(filtered.current).toHaveLength(2);
    expect(
      filtered.current.every(
        (item) => item.category === TransactionCategory.TRANSPORTATION,
      ),
    ).toBe(true);
  });

  test('should returns only transactions matching the amount', async () => {
    const amountToFilter = 200;
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        amount: amountToFilter,
      }),
    );

    expect(filtered.current).toHaveLength(2);
    expect(
      filtered.current.every((item) => item.amount === amountToFilter),
    ).toBe(true);
  });

  test('should returns only transactions above minAmount', async () => {
    const minAmountToFilter = 200;
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        minAmount: minAmountToFilter,
      }),
    );

    expect(filtered.current).toHaveLength(4);
    expect(
      filtered.current.every((item) => item.amount >= minAmountToFilter),
    ).toBe(true);
  });

  test('should returns only transactions below maxAmount', async () => {
    const maxAmountToFilter = 1000;
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        maxAmount: maxAmountToFilter,
      }),
    );

    expect(filtered.current).toHaveLength(4);
    expect(
      filtered.current.every((item) => item.amount <= maxAmountToFilter),
    ).toBe(true);
  });

  test('should returns only transactions matching the amount range', async () => {
    const minAmountToFilter = 100;
    const maxAmountToFilter = 500;
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        minAmount: minAmountToFilter,
        maxAmount: maxAmountToFilter,
      }),
    );

    expect(filtered.current).toHaveLength(4);
    expect(
      filtered.current.every(
        (item) =>
          item.amount >= minAmountToFilter && item.amount <= maxAmountToFilter,
      ),
    ).toBe(true);
  });

  test('should returns only recurring transactions when recurring is true', async () => {
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions as TransactionProps[], {
        recurring: true,
      }),
    );

    expect(filtered.current).toHaveLength(2);
    expect(filtered.current.every((item) => item.recurring === true)).toBe(
      true,
    );
  });

  test('should returns only transactions matching the recurring frequency', async () => {
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        frequency: RecurringFrequency.MONTHLY,
      }),
    );

    expect(filtered.current).toHaveLength(1);
    expect(
      filtered.current.every(
        (item) =>
          item.recurring_frequency?.frequency === RecurringFrequency.MONTHLY,
      ),
    ).toBe(true);
  });

  test('should returns all transactions when no filters are applied', async () => {
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {}),
    );

    expect(filtered.current).toEqual(mockTransactions);
  });

  test('should returns empty array when empty transactions array is provided', async () => {
    const dateToFilter = '2025-01-01';
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions([], {
        date: dateToFilter,
      }),
    );

    expect(filtered.current).toEqual([]);
  });

  test('should returns empty array when no matching transactions are found', async () => {
    const dateToFilter = '2027-01-01';
    const { result: filtered } = renderHook(() =>
      useFilteredTransactions(mockTransactions, {
        date: dateToFilter,
      }),
    );

    expect(filtered.current).toEqual([]);
  });
});
