import { mockBudgets } from "@/__mocks__/mockData";
import { editBudget, fetchBudgets } from "@/db/budgets";
import { useBudgets, useUpdateBudget } from "@/hooks/useBudgets";
import useShowToast from "@/hooks/useShowToast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from "react";

// Mock the useShowToast hook
jest.mock('@/hooks/useShowToast', () => ({
	__esModule: true,		// Indicates an ES module mock
	default: jest.fn(),		// Mock the default export
}));

// Mock the database functions
jest.mock("@/db/budgets", () => ({
	fetchBudgets: jest.fn(),
	editBudget: jest.fn(),
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

// Tests for useBudgets
describe('useBudgets', () => {
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

	test("should fetch budgets successfully", async () => {
		(fetchBudgets as jest.Mock).mockResolvedValue(mockBudgets);

		const { result } = renderHook(() => useBudgets(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toHaveLength(mockBudgets.length);
		expect(result.current.data).toEqual(mockBudgets);
	});

	test("should fail to fetch budgets", async () => {
		(fetchBudgets as jest.Mock).mockRejectedValue(new Error("fetchBudgets error"));

		const { result } = renderHook(() => useBudgets(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(result.current.data).toEqual([]);
	});
});

// Tests for useUpdateBudget
describe('useUpdateBudget', () => {
	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should edit budget successfully", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editBudget as jest.Mock).mockResolvedValue({
			success: true,
			messages: 'Budget updated successfully',
		});

		const { result } = renderHook(() => useUpdateBudget(), { wrapper });
		await act(async () => {
			result.current.mutate(mockBudgets[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'success',
				messages: 'Budget updated successfully',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
		});
	});

	test("should fail to edit budget", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editBudget as jest.Mock).mockResolvedValue({
			success: false,
			messages: 'Failed to update budget',
		});

		const { result } = renderHook(() => useUpdateBudget(), { wrapper });
		await act(async () => {
			result.current.mutate(mockBudgets[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'info',
				messages: 'Failed to update budget',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
		});
	});

	test("should throw error when editing budget", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editBudget as jest.Mock).mockRejectedValue(new Error("editBudget error"));

		const { result } = renderHook(() => useUpdateBudget(), { wrapper });
		await act(async () => {
			result.current.mutate(mockBudgets[0]);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'warning',
				messages: 'editBudget error',
			});
			expect(invalidateSpy).not.toHaveBeenCalled();
		});
	});
});