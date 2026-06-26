import * as SQLite from 'expo-sqlite';

import { DEFAULT_CURRENCY_KEY } from '@/constants/currency';
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

let dbInstance: SQLite.SQLiteDatabase | null = null; // To store the singleton instance
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Open local database
const getDatabaseInstance = async () => {
  try {
    if (dbInstance) {
      return dbInstance; // Return the existing instance
    }

    if (!dbPromise) {
      // Open the database if no instance exists
      dbPromise = SQLite.openDatabaseAsync('localDatabase.db').then((db) => {
        dbInstance = db;
        return db;
      });
    }

    return dbPromise;
  } catch (error) {
    throw new Error(`Error opening database: ${(error as Error).message}`);
  }
};

// Query queue to serialize database access
let dbQueue: Promise<unknown> = Promise.resolve();

export const runWithDb = async <T>(
  fn: (db: SQLite.SQLiteDatabase) => Promise<T>,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  if (dbInstance) {
    return fn(dbInstance);
  }

  const result = dbQueue.then(async () => {
    const db = await getDatabaseInstance();
    return fn(db);
  });

  dbQueue = result.catch(() => {}); // keep queue alive after failures
  return result;
};

// Initialise database
const initializeDatabase = async (dbInstance?: SQLite.SQLiteDatabase) => {
  try {
    // Get the database instance
    const db = dbInstance || (await getDatabaseInstance());

    // Create the tables
    await db.execAsync(`
      ${transactionTableSchema}
      ${budgetTableSchema}
      ${accountTableSchema}
      ${investmentTableSchema}
    `);

    // Insert default account
    await db.runAsync(
      `INSERT INTO accounts (${joinTableColumns(accountTableColumns)}) VALUES ('Cash', ${AccountType.CASH}, 0.0, ${DEFAULT_CURRENCY_KEY}, 0);`,
    );
  } catch (error) {
    throw new Error(
      `Error creating the database or table: ${(error as Error).message}`,
    );
  }
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
