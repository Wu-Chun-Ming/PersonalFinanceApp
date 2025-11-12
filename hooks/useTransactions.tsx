import { TransactionProps } from "@/constants/Types";
import {
    createTransaction,
    deleteTransaction,
    editTransaction,
    fetchTransaction,
    fetchTransactions,
} from "@/services/transactions";
import { router } from "expo-router";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";

// Custom hook to fetch transactions
export const useTransactions = () => {
    return useCustomQuery<TransactionProps[]>({
        queryKey: ['transactions'],
        queryFn: fetchTransactions,
        fallbackValue: [],
    });
};

// Custom hook to fetch a single transaction
export const useTransaction = (transactionId: number) => {
    return useCustomQuery<TransactionProps | null>({
        queryKey: ['transaction', transactionId],
        queryFn: () => fetchTransaction(Number(transactionId)),
        fallbackValue: null,
        onError: () => router.back(),   // Navigate back if error occurs
        options: {
            enabled: !!transactionId,
        },
    });
};

// Custom hook to create a transaction
export const useCreateTransaction = () => {
    return useCustomMutation({
        mutationFn: (newTransactionData: TransactionProps) => createTransaction(newTransactionData),
        invalidateKeys: () => [['transactions']],       // Invalidate transactions query on success
        onInvalidationComplete: () => router.back(),    // Navigate to previous page after creating transaction
    });
}

// Custom hook to update a transaction
export const useUpdateTransaction = () => {
    return useCustomMutation({
        mutationFn: ({ id, updatedTransactionData }: { id: number, updatedTransactionData: TransactionProps }) => editTransaction(id, updatedTransactionData),
        invalidateKeys: (variables) => [
            ['transaction', variables?.id],
            ['transactions'],   // Invalidate transaction and transactions queries on success
        ],
    });
}

// Custom hook to delete a transaction
export const useDeleteTransaction = () => {
    return useCustomMutation({
        mutationFn: (id: number) => deleteTransaction(id),
        invalidateKeys: () => [['transactions']],       // Invalidate transactions query on success
        onInvalidationComplete: () => router.back(),    // Navigate to previous page after deleting transaction
    });
}