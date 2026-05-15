import { updateBudget } from '@/database/budgetDatabase';
import { storeTransaction } from '@/database/transactionDatabase';
import { BudgetProps, FileType, TransactionProps } from '@/types';
import { importDataFromFile } from '@/utils/file';
import { exportData, pickFile } from '@/utils/io';
import { fetchBudgets } from './budgetService';
import { fetchTransactions } from './transactionService';

interface BackupPayload {
  transactions: TransactionProps[];
  budgets: BudgetProps[];
}

// Export all database data to file
export const exportAllData = async (fileType: FileType) => {
  try {
    return await exportData<BackupPayload>(
      fileType,
      async () => {
        const [transactions, budgets] = await Promise.all([
          fetchTransactions(),
          fetchBudgets(),
        ]);

        if (transactions.length === 0 && budgets.length === 0) {
          return [];
        }

        return [{ transactions, budgets }];
      },
      'exported_backup',
      'backup',
    );
  } catch (error) {
    console.error(`Failed to export all data: ${(error as Error).message}`);
    throw error;
  }
};

// Import data from file and save to database
export const importAllData = async (fileType: FileType) => {
  try {
    const fileUri = await pickFile(fileType);
    if (!fileUri) {
      throw new Error('No file selected for import.');
    }

    const rawData: BackupPayload[] = await importDataFromFile(
      fileUri,
      fileType,
    );
    const { transactions, budgets } = rawData[0];

    // Process backup data items
    let importedTransactionsCount = 0;
    let importedBudgetsCount = 0;
    let failedCount = 0;

    const importQueue: (
      | { type: 'transaction'; data: TransactionProps }
      | { type: 'budget'; data: BudgetProps }
    )[] = [
      ...transactions.map((data) => ({ type: 'transaction' as const, data })),
      ...budgets.map((data) => ({ type: 'budget' as const, data })),
    ];

    for (const item of importQueue) {
      try {
        const success =
          item.type === 'transaction'
            ? await storeTransaction(item.data)
            : await updateBudget(item.data.amount, {
                year: item.data.year,
                month: item.data.month,
                category: item.data.category,
              });
        if (success) {
          if (item.type === 'transaction') importedTransactionsCount++;
          else if (item.type === 'budget') importedBudgetsCount++;
        } else {
          failedCount += 1;
        }
      } catch {
        failedCount += 1;
      }
    }

    const importedTotal = importedTransactionsCount + importedBudgetsCount;

    let messages: string;
    if (importedTotal > 0) {
      messages = `Imported ${importedTransactionsCount} transactions and ${importedBudgetsCount} budgets from ${fileType.toUpperCase()} backup`;
      if (failedCount === 0) {
        messages += ' successfully.';
      } else if (failedCount > 0) {
        messages += ` (${failedCount} items failed).`;
      }
    } else if (importedTotal === 0 && failedCount > 0) {
      messages = `Failed to import data from ${fileType.toUpperCase()} backup. ${failedCount} items failed.`;
    } else {
      messages = `No transactions or budgets were imported from ${fileType.toUpperCase()} backup. Check the file and try again.`;
    }

    return {
      success: importedTotal > 0,
      messages,
    };
  } catch (error) {
    console.error(`Failed to import all data: ${(error as Error).message}`);
    throw error;
  }
};
