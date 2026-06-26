import * as SQLite from 'expo-sqlite';

// Custom import
import { runWithDb } from '@/database/init';
import { AccountProps, DatabaseOptions } from '@/types';
import {
  accountTableColumns,
  generateTablePlaceholders,
  joinTableColumns,
} from './schema';

const getAccountValues = (account: AccountProps) => {
  return [
    account.name,
    account.type,
    account.balance,
    account.currency,
    account.earnReturns,
    new Date().toISOString(),
  ];
};

const transformAccount = (account: any): AccountProps => {
  return {
    ...account,
    earnReturns: Boolean(account.earnReturns),
  };
};

// Fetch all accounts
export const getAccounts = async ({ dbInstance }: DatabaseOptions = {}) => {
  return runWithDb(async (db) => {
    try {
      // Fetch all the data from table
      const result: AccountProps[] = await db.getAllAsync(
        `SELECT * FROM accounts`,
      );

      // Successful fetched
      if (result.length > 0) {
        return {
          data: result.map(transformAccount),
        };
      }

      // No data fetched
      return {
        data: [],
      };
    } catch (error) {
      throw new Error(
        `Error fetching data from accounts table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

// Fetch specific account
export const showAccount = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Fetch the data
      const result: AccountProps | null = await db.getFirstAsync(
        `SELECT * FROM accounts WHERE id = ?`,
        id,
      );

      // Successful fetched
      if (result) {
        return {
          data: transformAccount(result),
        };
      }

      return {
        data: null,
      };
    } catch (error) {
      throw new Error(`Error fetching account: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Store new account
export const storeAccount = async (
  account: AccountProps,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Insert the account
      const result = await db.runAsync(
        `INSERT INTO accounts (${joinTableColumns(accountTableColumns.slice(1))}) 
          VALUES (${generateTablePlaceholders(accountTableColumns.length - 1)})
        `,
        ...getAccountValues(account),
      );

      // Successful insertion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Account created successfully',
            id: result.lastInsertRowId ?? null,
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to create account',
          id: null,
        },
      };
    } catch (error) {
      throw new Error(`Error creating account: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Update account details
export const updateAccount = async (
  account: AccountProps,
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Update the account
      const result = await db.runAsync(
        `UPDATE accounts SET ${joinTableColumns(accountTableColumns.slice(1), ' = ?, ')} = ? WHERE id = ?`,
        ...getAccountValues(account),
        id,
      );

      // Successful update
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Account updated successfully',
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to update account',
        },
      };
    } catch (error) {
      throw new Error(`Error updating account: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Delete account and its associated transactions
export const destroyAccount = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Delete the specific account
      const result = await db.runAsync(`DELETE FROM accounts WHERE id = ?`, id);

      // Successful deletion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Account deleted successfully',
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to delete account',
        },
      };
    } catch (error) {
      throw new Error(`Error deleting account: ${(error as Error).message}`);
    }
  }, dbInstance);
};
