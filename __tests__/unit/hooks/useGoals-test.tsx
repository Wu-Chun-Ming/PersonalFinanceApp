import {
	mockDefaultGoals,
	mockGoals,
} from "@/__mocks__/mockData";
import { useGoals, useUpdateGoal } from "@/hooks/useGoals";
import useShowToast from "@/hooks/useShowToast";
import {
	editGoal,
	fetchGoal,
} from "@/services/goals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from "react";

// Mock the useShowToast hook
jest.mock('@/hooks/useShowToast', () => ({
	__esModule: true,		// Indicates an ES module mock
	default: jest.fn(),		// Mock the default export
}));

// Mock the goals functions
jest.mock("@/services/goals", () => ({
	fetchGoal: jest.fn(),
	editGoal: jest.fn(),
	resetGoal: jest.fn(),
}));

// Create a wrapper for the React Query client
const queryClient = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

// Tests for useGoals
describe('useGoals', () => {
	beforeAll(() => {
		jest.spyOn(console, "error").mockImplementation(() => { });
	});

	afterAll(() => {
		(console.error as jest.Mock).mockRestore();
		jest.resetAllMocks();
	});

	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should fetch goals successfully", async () => {
		(fetchGoal as jest.Mock).mockResolvedValueOnce(mockGoals.savings);
		(fetchGoal as jest.Mock).mockResolvedValueOnce(mockGoals.income);

		const { result } = renderHook(() => useGoals(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));

		expect(fetchGoal).toHaveBeenCalledTimes(2);
		expect(result.current.data).toEqual(mockGoals);
	});

	test("should throw error when fetching goals", async () => {
		(fetchGoal as jest.Mock).mockRejectedValue(new Error("fetchGoal error"));

		const { result } = renderHook(() => useGoals(), { wrapper });

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		await expect(fetchGoal).rejects.toThrow("fetchGoal error");
		expect(result.current.data).toEqual(mockDefaultGoals);
	});
});

// Tests for useUpdateGoal
describe('useUpdateGoal', () => {
	beforeEach(() => {
		queryClient.clear();
		jest.clearAllMocks();
	});

	test("should edit goal successfully", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editGoal as jest.Mock).mockResolvedValueOnce({
			success: true,
			messages: 'Goals updated successfully',
		});

		const { result } = renderHook(() => useUpdateGoal(), { wrapper });
		await act(async () => {
			result.current.mutate(mockGoals);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'success',
				messages: 'Goals updated successfully',
			});
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['goals'] });
		});
	});

	test("should throw error when editing goal", async () => {
		const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
		const mockShowToast = jest.fn();
		(useShowToast as jest.Mock).mockReturnValue(mockShowToast);
		(editGoal as jest.Mock).mockRejectedValueOnce(new Error("editGoal error"));

		const { result } = renderHook(() => useUpdateGoal(), { wrapper });
		await act(async () => {
			result.current.mutate(mockGoals);
		});

		await waitFor(() => {
			expect(mockShowToast).toHaveBeenCalledWith({
				action: 'warning',
				messages: 'editGoal error',
			});
			expect(invalidateSpy).not.toHaveBeenCalled();
		});
	});
});