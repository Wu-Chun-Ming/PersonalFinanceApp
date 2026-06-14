import dayjs from 'dayjs';

import { storeAccount } from '@/database/accountDatabase';
import { updateBudget } from '@/database/budgetDatabase';
import { storeTransaction } from '@/database/transactionDatabase';
import { AccountProps, BudgetProps, FileType, TransactionProps } from '@/types';
import { importDataFromFile } from '@/utils/file';
import { exportData, pickFile } from '@/utils/io';
import { fetchAccounts } from './accountService';
import { fetchBudgets } from './budgetService';
import { fetchTransactions } from './transactionService';

interface BackupPayload {
  transactions: TransactionProps[];
  budgets: BudgetProps[];
  accounts: AccountProps[];
}

// Export all database data to file
export const exportAllData = async (fileType: FileType) => {
  try {
    return await exportData<BackupPayload>(
      fileType,
      async () => {
        const [transactions, budgets, accounts] = await Promise.all([
          fetchTransactions(),
          fetchBudgets(),
          fetchAccounts(),
        ]);

        if (
          transactions.length === 0 &&
          budgets.length === 0 &&
          accounts.length === 0
        ) {
          return [];
        }

        return [{ transactions, budgets, accounts }];
      },
      `exported_backup_${dayjs(new Date()).format('YYYY-MM-DD_HH-mm-ss')}`,
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
    const { transactions, budgets, accounts } = rawData[0];

    // Process backup data items
    let importedTransactionsCount = 0;
    let importedBudgetsCount = 0;
    let importedAccountsCount = 0;
    let failedCount = 0;

    const importQueue: (
      | { type: 'transaction'; data: TransactionProps }
      | { type: 'budget'; data: BudgetProps }
      | { type: 'account'; data: AccountProps }
    )[] = [
      ...transactions.map((data) => ({ type: 'transaction' as const, data })),
      ...budgets.map((data) => ({ type: 'budget' as const, data })),
      ...accounts.map((data) => ({ type: 'account' as const, data })),
    ];

    for (const item of importQueue) {
      try {
        let result: {
          data: {
            success: boolean;
            messages: string;
          };
        };

        switch (item.type) {
          case 'transaction':
            result = await storeTransaction(item.data);
            break;
          case 'budget':
            result = await updateBudget(item.data.amount, {
              year: item.data.year,
              month: item.data.month,
              category: item.data.category,
            });
            break;
          case 'account':
            result = await storeAccount(item.data);
            break;
        }

        const { success } = result.data;
        if (success) {
          if (item.type === 'transaction') importedTransactionsCount++;
          else if (item.type === 'budget') importedBudgetsCount++;
          else if (item.type === 'account') importedAccountsCount++;
        } else {
          failedCount += 1;
        }
      } catch {
        failedCount += 1;
      }
    }

    const importedTotal =
      importedTransactionsCount + importedBudgetsCount + importedAccountsCount;

    let messages: string;
    if (importedTotal > 0) {
      messages = `Imported ${importedTransactionsCount} transactions, ${importedBudgetsCount} budgets, and ${importedAccountsCount} accounts from ${fileType.toUpperCase()} backup`;
      if (failedCount === 0) {
        messages += ' successfully.';
      } else if (failedCount > 0) {
        messages += ` (${failedCount} items failed).`;
      }
    } else if (importedTotal === 0 && failedCount > 0) {
      messages = `Failed to import data from ${fileType.toUpperCase()} backup. ${failedCount} items failed.`;
    } else {
      messages = `No transactions, budgets, or accounts were imported from ${fileType.toUpperCase()} backup. Check the file and try again.`;
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
