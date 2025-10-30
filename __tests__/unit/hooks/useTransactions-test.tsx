import { mockTransactions } from "@/__mocks__/mockData";
import { createTransaction, deleteTransaction, editTransaction, fetchTransaction, fetchTransactions } from "@/db/transactions";
import useShowToast from "@/hooks/useShowToast";
import { useCreateTransaction, useDeleteTransaction, useTransaction, useTransactions, useUpdateTransaction } from "@/hooks/useTransactions";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from "expo-router";
import { ReactNode } from "react";

// Mock the router
jest.mock('expo-router', () => ({
	router: {
		back: jest.fn(),
	},
}));

// Mock the useShowToast hook
jest.mock('@/hooks/useShowToast', () => ({
	__esModule: true,		// Indicates an ES module mock
	default: jest.fn(),		// Mock the default export
}));

// Mock the database functions
jest.mock("@/db/transactions", () => ({
	fetchTransaction: jest.fn(),
	fetchTransactions: jest.fn(),
	createTransaction: jest.fn(),
	editTransaction: jest.fn(),
	deleteTransaction: jest.fn(),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeAll(() => {
  jest.useFakeTimers();	// Use fake timers in tests
});

afterAll(() => {
  jest.useRealTimers(); // Restore real timers after all tests
});

// Tests for useTransactions
describe('useTransactions', () => {
	beforeAll(async () => {
		jest.spyOn(console, 'error').mockImplementation(() => { });
	});

	afterAll(() => {
		(console.error as jest.Mock).mockRestore();
		jest.resetAllMocks();
	});

	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should fetch transactions successfully", async () => {
		(fetchTransactions as jest.Mock).mockResolvedValue(mockTransactions);

		const { result } = renderHook(() => useTransactions(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toHaveLength(mockTransactions.length);
		expect(result.current.data).toEqual(mockTransactions);
	});

	test("should fail to fetch transactions", async () => {
		(fetchTransactions as jest.Mock).mockRejectedValue(new Error("fetchTransactions error"));

		const { result } = renderHook(() => useTransactions(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual([]);
	});
});

// Tests for useTransaction
describe('useTransaction', () => {
	beforeAll(async () => {
		jest.spyOn(console, 'error').mockImplementation(() => { });
	});

	afterAll(() => {
		(console.error as jest.Mock).mockRestore();
	});

	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should fetch transaction successfully", async () => {
		(fetchTransaction as jest.Mock).mockResolvedValue(mockTransactions[0]);

		const { result } = renderHook(() => useTransaction(1), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(mockTransactions[0]);
	});

	test("should fail to fetch transaction", async () => {
		(fetchTransaction as jest.Mock).mockRejectedValue(new Error("fetchTransaction error"));

		const { result } = renderHook(() => useTransaction(1), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual(null);
		// expect(result.current.data).toBeNull();
		expect(fetchTransaction).toHaveBeenCalledWith(1);
		expect(router.back).toHaveBeenCalled();
	});
});

// Tests for useCreateTransaction
describe('useCreateTransaction', () => {
	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	afterAll(() => {
		jest.resetAllMocks();
	});

	test("should create transaction successfully", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(createTransaction as jest.Mock).mockResolvedValue({
			success: true,
			messages: 'Transaction created successfully',
		});

		const { result } = renderHook(() => useCreateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(mockTransactions[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'success',
				messages: 'Transaction created successfully',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
			expect(router.back).toHaveBeenCalled();
		});
	});

	test("should fail to create transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(createTransaction as jest.Mock).mockResolvedValue({
			success: false,
			messages: 'Failed to create transaction',
		});

		const { result } = renderHook(() => useCreateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(mockTransactions[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'info',
				messages: 'Failed to create transaction',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
		});
	});

	test("should throw error when creating transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(createTransaction as jest.Mock).mockRejectedValue(new Error("createTransaction error"));

		const { result } = renderHook(() => useCreateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(mockTransactions[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'warning',
				messages: 'createTransaction error',
			});
			expect(invalidateSpy).not.toHaveBeenCalled();
		});
	});
});

// Tests for useUpdateTransaction
describe('useUpdateTransaction', () => {
	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should edit transaction successfully", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editTransaction as jest.Mock).mockResolvedValue({
			success: true,
			messages: 'Transaction updated successfully',
		});

		const { result } = renderHook(() => useUpdateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate({
				id: 1,
				updatedTransactionData: mockTransactions[0],
			});
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'success',
				messages: 'Transaction updated successfully',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transaction', 1] });
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
		});
	});

	test("should fail to edit transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editTransaction as jest.Mock).mockResolvedValue({
			success: false,
			messages: 'Failed to update transaction',
		});

		const { result } = renderHook(() => useUpdateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate({
				id: 1,
				updatedTransactionData: mockTransactions[0],
			});
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'info',
				messages: 'Failed to update transaction',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transaction', 1] });
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
		});
	});

	test("should throw error when editing transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editTransaction as jest.Mock).mockRejectedValue(new Error("editTransaction error"));

		const { result } = renderHook(() => useUpdateTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate({
				id: 1,
				updatedTransactionData: mockTransactions[0],
			});
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'warning',
				messages: 'editTransaction error',
			});
			expect(invalidateSpy).not.toHaveBeenCalled();
		});
	});
});

// Tests for useDeleteTransaction
describe('useDeleteTransaction', () => {
	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should delete transaction successfully", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(deleteTransaction as jest.Mock).mockResolvedValue({
			success: true,
			messages: 'Transaction deleted successfully',
		});

		const { result } = renderHook(() => useDeleteTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'success',
				messages: 'Transaction deleted successfully',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
			expect(router.back).toHaveBeenCalled();
		});
	});

	test("should fail to delete transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(deleteTransaction as jest.Mock).mockResolvedValue({
			success: false,
			messages: 'Failed to delete transaction',
		});

		const { result } = renderHook(() => useDeleteTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'info',
				messages: 'Failed to delete transaction',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
		});
	});

	test("should throw error when deleting transaction", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(deleteTransaction as jest.Mock).mockRejectedValue(new Error("deleteTransaction error"));

		const { result } = renderHook(() => useDeleteTransaction(), { wrapper });
		await act(async () => {
			result.current.mutate(1);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'warning',
				messages: 'deleteTransaction error',
			});
			expect(invalidateSpy).not.toHaveBeenCalled();
		});
	});
});