import { RRule } from 'rrule';

import {
  destroyTransaction,
  getTransactions,
  getTransactionYears,
  showTransaction,
  storeBatchTransactions,
  storeTransaction,
  updateTransaction,
} from '@/database/transactionDatabase';
import {
  DatabaseOptions,
  FileType,
  TransactionMultiDateProps,
  TransactionProps,
} from '@/types';
import { exportData, importData, pickFile } from '@/utils/io';

// Fetch transactions
export const fetchTransactions = async (options?: DatabaseOptions) => {
  const response = await getTransactions(options);
  return response.data;
};

// Fetch single transaction
export const fetchTransaction = async (id: number) => {
  const response = await showTransaction(id);
  return response.data;
};

// Create transactions
export const createTransactions = async (
  newBatchTransactionData: TransactionProps | TransactionMultiDateProps,
) => {
  const response = await storeBatchTransactions(newBatchTransactionData);
  return response.data;
};

// Edit transaction
export const editTransaction = async (
  id: number,
  updatedTransactionData: TransactionProps,
) => {
  const response = await updateTransaction(updatedTransactionData, id);
  return response.data;
};

// Delete transaction
export const deleteTransaction = async (id: number) => {
  const response = await destroyTransaction(id);
  return response.data;
};

// Export all transactions
export const exportAllTransactions = async (fileType: FileType) => {
  return exportData<TransactionProps>(
    fileType,
    async () => {
      const { data } = await getTransactions();
      return data;
    },
    'exported_transactions',
    'transaction',
  );
};

// Import transactions from file
export const importTransactions = async (fileType: FileType) => {
  const fileUri = await pickFile(fileType);

  return importData<TransactionProps>(
    fileType,
    async (transaction) => {
      const response = await storeTransaction(transaction as TransactionProps);
      return response.data.success;
    },
    'transaction',
    fileUri,
  );
};

// Add transaction(s) based on recurring transactions in the database
export const handleRecurringTransactions = async (lastOpenDate: Date) => {
  const transactions = await fetchTransactions();
  const recurringTransactions = transactions.filter((t) => t.recurring);
  if (recurringTransactions.length === 0) return;

  const todayDateObj = new Date();
  if (
    lastOpenDate.getFullYear() === todayDateObj.getFullYear() &&
    lastOpenDate.getMonth() === todayDateObj.getMonth() &&
    lastOpenDate.getDate() === todayDateObj.getDate()
  )
    return;

  try {
    let lastOpenDateObj = new Date(lastOpenDate.getTime());
    lastOpenDateObj.setDate(lastOpenDateObj.getDate() + 1); // Exclude last open date

    if (lastOpenDateObj < todayDateObj) {
      // Format to `YYYYMMDDTHHmmss`
      const lastOpenDate = lastOpenDateObj
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0];
      const today = todayDateObj
        .toISOString()
        .replace(/[-:]/g, '')
        .split('.')[0];
      for (const transaction of recurringTransactions) {
        if (!transaction.recurring_frequency) continue;
        const { frequency: freq, time } = transaction.recurring_frequency;
        const { month, day, date } = time;

        // Construct RRule string
        let rruleStr = `DTSTART:${lastOpenDate}\nRRULE:`;
        if (freq) rruleStr += `FREQ=${freq};`;
        if (month) rruleStr += `BYMONTH=${month};`;
        if (day) rruleStr += `BYDAY=${day};`;
        if (date) rruleStr += `BYMONTHDAY=${date};`;
        rruleStr += `UNTIL=${today}`;

        // Generate dates using RRule
        const rule = RRule.fromString(rruleStr);
        // Create transactions for each generated date
        await createTransactions({
          ...transaction,
          date: rule.all(),
        });
      }
    }
  } catch (error) {
    console.error(
      'Error updating recurring transactions:',
      (error as Error).message,
    );
  }
};

// Fetch available transaction years
export const fetchTransactionYears = async () => {
  const response = await getTransactionYears();
  return response.data;
};
