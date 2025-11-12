import { TransactionProps } from "@/constants/Types";
import {
    destroyTransaction,
    getTransactions,
    showTransaction,
    storeTransaction,
    updateTransaction,
} from "@/database/transactionDatabase";

// Fetch transactions
export const fetchTransactions = async () => {
    const response = await getTransactions();
    return response.data;
};

// Fetch single transaction
export const fetchTransaction = async (id: number) => {
    const response = await showTransaction(id);
    return response.data;
};

// Create transaction
export const createTransaction = async (newTransactionData: TransactionProps) => {
    const response = await storeTransaction(newTransactionData);
    return response.data;
}

// Edit transaction
export const editTransaction = async (id: number, updatedTransactionData: TransactionProps) => {
    const response = await updateTransaction(updatedTransactionData, id);
    return response.data;
};

// Delete transaction
export const deleteTransaction = async (id: number) => {
    const response = await destroyTransaction(id);
    return response.data;
};