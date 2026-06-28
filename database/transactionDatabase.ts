import * as SQLite from 'expo-sqlite';

// Custom import
import {
  deleteRow,
  getAllData,
  getRowByPrimaryKey,
  insertRow,
  runWithDb,
  updateRow,
} from '@/database';
import {
  DatabaseOptions,
  TransactionMultiDateProps,
  TransactionProps,
  TransactionTypeValue,
} from '@/types';
import { transactionTableColumns } from './schema';

const getTransactionValues = (transaction: TransactionProps) => {
  return [
    transaction.date ? transaction.date.toString() : null,
    transaction.type,
    transaction.category,
    transaction.amount,
    transaction?.description,
    transaction.recurring,
    JSON.stringify(transaction.recurring_frequency),
    transaction.accountId,
  ];
};

const transformTransaction = (transaction: any): TransactionProps => {
  return {
    ...transaction,
    date: transaction.date ? new Date(transaction.date) : null,
    recurring: Boolean(transaction.recurring),
    recurring_frequency: transaction.recurring_frequency
      ? JSON.parse(transaction.recurring_frequency)
      : null,
  };
};

// Fetch all transaction
export const getTransactions = async ({
  sortOptions,
  dbInstance,
}: DatabaseOptions = {}) => {
  return getAllData<TransactionProps>(
    'transactions',
    { dbInstance, sortOptions },
    transformTransaction,
  );
};

// Fetch specific transaction
export const showTransaction = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return getRowByPrimaryKey<TransactionProps>(
    'transactions',
    'id',
    id,
    { dbInstance },
    transformTransaction,
  );
};

// Store new transaction
export const storeTransaction = async (
  transaction: TransactionProps,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return insertRow(
    'transactions',
    preserveId ? transactionTableColumns : transactionTableColumns.slice(1), // Exclude 'id' column for insertion if not preserving
    [
      ...(preserveId ? [transaction.id] : []),
      ...getTransactionValues(transaction),
    ],
    { dbInstance },
  );
};

export const storeBatchTransactions = async (
  transaction: TransactionProps | TransactionMultiDateProps,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    let result: { data: { success: boolean; messages: string } } | undefined;
    await db.withTransactionAsync(async () => {
      // SINGLE / MULTIPLE DATES
      if (transaction.date) {
        const dates = Array.isArray(transaction.date)
          ? transaction.date
          : [transaction.date];
        const results = await Promise.all(
          dates.map((date) =>
            storeTransaction(
              {
                ...transaction,
                date,
              },
              false,
              db,
            ),
          ),
        );

        const successCount = results.filter((r) => r.data.success).length;
        const failCount = results.length - successCount;

        result = {
          data: {
            success: failCount === 0,
            messages:
              failCount === 0
                ? `${successCount} transaction${successCount === 1 ? '' : 's'} created successfully`
                : `${successCount} succeeded, ${failCount} failed to create`,
          },
        };

        return;
      } else {
        // RECURRING
        result = await storeTransaction(
          transaction as TransactionProps,
          false,
          db,
        );
      }
    });

    if (!result) {
      throw new Error(`Error creating batch transactions`);
    }

    return result;
  }, dbInstance);
};

// Update transaction details
export const updateTransaction = async (
  transaction: TransactionProps,
  id: number,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return updateRow(
    'transactions',
    preserveId ? transactionTableColumns : transactionTableColumns.slice(1), // Exclude 'id' column for update if not preserving
    [
      ...(preserveId ? [transaction.id] : []),
      ...getTransactionValues(transaction),
    ],
    'id',
    id,
    { dbInstance },
  );
};

// Delete transaction
export const destroyTransaction = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return deleteRow('transactions', 'id', id, { dbInstance });
};

// Fetch available years from transactions
export const getTransactionYears = async (
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Query for distinct years
      const result = await db.getAllAsync<{
        year: number;
      }>(`
            SELECT DISTINCT strftime('%Y', date) AS year
            FROM transactions
            WHERE date IS NOT NULL
            ORDER BY year ASC
        `);

      // Return transaction years
      if (result.length > 0) {
        return {
          data: result.map((row) => Number(row.year)),
        };
      }

      // No years found
      return {
        data: [],
      };
    } catch (error) {
      throw new Error(
        `Error fetching available years from transactions table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

// Fetch common descriptions with frequency and recency
export const getCommonDescriptions = async (
  transactionType?: TransactionTypeValue,
  limit = 20,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      const params = transactionType ? [transactionType, limit] : [limit];
      const result = await db.getAllAsync<{
        description: string;
        freq: number;
        last_date: string | null;
      }>(
        `
            SELECT description, COUNT(*) as freq, MAX(date) as last_date
            FROM transactions
            WHERE description IS NOT NULL AND description != ''
            ${transactionType ? 'AND type = ?' : ''}
            GROUP BY description
            ORDER BY freq DESC, last_date DESC
            LIMIT ?
        `,
        ...params,
      );

      if (result.length > 0) {
        return {
          data: result.map((row) => row.description),
        };
      }

      return {
        data: [],
      };
    } catch (error) {
      throw new Error(
        `Error fetching common descriptions: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};
