import * as SQLite from 'expo-sqlite';

import {
  getDatabaseInitialized,
  setDatabaseInitialized,
} from '@/services/appState';
import {
  accountTableSchema,
  budgetTableSchema,
  transactionTableSchema,
} from './schema';

let dbInstance: SQLite.SQLiteDatabase | null = null; // To store the singleton instance

// Open local database
const getDatabaseInstance = async () => {
  try {
    if (!dbInstance) {
      // Open the database if no instance exists
      dbInstance = await SQLite.openDatabaseAsync('localDatabase.db');
    }
    return dbInstance; // Return the existing or newly created instance
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
        `);
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
