import * as SQLite from 'expo-sqlite';

import { DEFAULT_CURRENCY_KEY } from '@/constants/currency';
import { insertRow, runWithDb } from '@/database';
import {
  getDatabaseInitialized,
  setDatabaseInitialized,
} from '@/services/appState';
import { AccountType } from '@/types';
import {
  accountTableColumns,
  accountTableSchema,
  budgetTableSchema,
  investmentTableSchema,
  joinTableColumns,
  transactionTableSchema,
} from './schema';

// Initialise database
const initializeDatabase = async (dbInstance?: SQLite.SQLiteDatabase) => {
  runWithDb(async (db) => {
    try {
      // Create the tables
      await db.execAsync(`
        ${transactionTableSchema}
        ${budgetTableSchema}
        ${accountTableSchema}
        ${investmentTableSchema}
      `);

      // Insert default account
      await insertRow(
        'accounts',
        accountTableColumns.slice(1, -1),
        ['Cash', AccountType.CASH, 0.0, DEFAULT_CURRENCY_KEY, 0],
        { dbInstance: db },
      );
    } catch (error) {
      throw new Error(
        `Error creating the database or table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

// Check if the database has been initialized
export const checkDatabaseInitialization = async () => {
  try {
    const dbInitialized = await getDatabaseInitialized();

    // Create the database if not initialized
    if (!dbInitialized) {
      await initializeDatabase();
      await setDatabaseInitialized(true);
    }
  } catch (error) {
    console.error(
      'Error checking database initialization:',
      (error as Error).message,
    );
  }
};
