import { TransactionProps } from "@/constants/Types";
import { createTransaction, deleteTransaction, editTransaction, fetchTransaction, fetchTransactions } from "@/db/transactions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import useShowToast from "./useShowToast";

// Custom hook to fetch transactions
export const useTransactions = () => {
    return useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                return await fetchTransactions();
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    });
};

// Custom hook to fetch a single transaction
export const useTransaction = (transactionId: number) => {
    return useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: async () => {
            try {
                return await fetchTransaction(Number(transactionId));
            } catch (error) {
                console.error(error);
                router.back(); // Navigate to previous page if error occurs
                return null;
            }
        },
        enabled: !!transactionId,
    });
};

// Custom hook to create a transaction
export const useCreateTransaction = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();

    return useMutation({
        mutationFn: (newTransactionData: TransactionProps) => createTransaction(newTransactionData),
        onSuccess: (response) => {
            const { success, messages } = response;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['transactions'] });      // Refresh transaction data after creating new transaction
                router.back(); // Navigate to previous page after creating transaction
            }
        },
    });
}

// Custom hook to update a transaction
export const useUpdateTransaction = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();

    return useMutation({
        mutationFn: ({ id, updatedTransactionData }: { id: number, updatedTransactionData: TransactionProps }) => editTransaction(id, updatedTransactionData),
        onSuccess: (response) => {
            const { success, messages } = response;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error, variables) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
                queryClient.invalidateQueries({ queryKey: ['transactions'] });
            }
        },
    });
}

// Custom hook to delete a transaction
export const useDeleteTransaction = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();

    return useMutation({
        mutationFn: (id: number) => deleteTransaction(id),
        onSuccess: (response) => {
            const { success, messages } = response;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['transactions'] });     // Refresh transactions after delete transaction
                router.back(); // Navigate to previous page after deleting transaction
            }
        },
    });
}