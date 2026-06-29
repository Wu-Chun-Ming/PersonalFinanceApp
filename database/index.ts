import * as SQLite from 'expo-sqlite';

import { DatabaseOptions } from '@/types';
import {
  generateTablePlaceholders,
  joinTableColumns,
  tableInfo,
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

export const getAllData = async <T>(
  table: string,
  { dbInstance, sortOptions, where }: DatabaseOptions = {},
  transformFn: (item: any) => T = (item: any) => item as T,
) => {
  return runWithDb(async (db) => {
    try {
      // Fetch all the data from table
      const result: T[] = await db.getAllAsync(
        `SELECT * FROM ${table}` +
          (where
            ? ` WHERE ${where.field} ${where.operator} ${where.value}`
            : '') +
          (sortOptions
            ? ` ORDER BY ${sortOptions.sortField} ${sortOptions.sortOrder}`
            : ''),
      );

      // Successful fetched
      if (result.length > 0) {
        return {
          data: result.map(transformFn),
        };
      }

      // No data fetched
      return {
        data: [],
      };
    } catch (error) {
      throw new Error(
        `Error fetching data from ${table} table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

export const getRowByPrimaryKey = async <T>(
  table: string,
  primaryKeyField: string,
  primaryKeyValue: any,
  { dbInstance }: DatabaseOptions = {},
  transformFn: (item: any) => T = (item: any) => item as T,
) => {
  return runWithDb(async (db) => {
    try {
      // Fetch the data from table by primary key
      const result = await db.getFirstAsync(
        `SELECT * FROM ${table}` + ` WHERE ${primaryKeyField} = ?`,
        primaryKeyValue,
      );

      // Successful fetched
      if (result) {
        return {
          data: transformFn(result),
        };
      }

      // No data fetched
      return {
        data: null,
      };
    } catch (error) {
      throw new Error(
        `Error fetching data from ${table} table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

export const insertRow = async (
  table: string,
  tableColumns: string[],
  rowValues: any[],
  { dbInstance }: DatabaseOptions = {},
  clauses: string = '',
  upsert: boolean = false,
) => {
  const { entityName } = tableInfo[table];

  return runWithDb(async (db) => {
    try {
      // Insert row into the table
      const result = await db.runAsync(
        `INSERT INTO ${table} (${joinTableColumns(tableColumns)})` +
          ` VALUES (${generateTablePlaceholders(tableColumns.length)})` +
          ` ${clauses}`,
        ...rowValues,
      );

      // Successful insertion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} ${upsert ? 'updated' : 'created'} successfully`,
            id: result.lastInsertRowId ?? null,
          },
        };
      }

      return {
        data: {
          success: false,
          messages: `Failed to ${upsert ? 'update' : 'create'} ${entityName}`,
          id: null,
        },
      };
    } catch (error) {
      throw new Error(
        `Error ${upsert ? 'upserting' : 'creating'} ${entityName}: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

export const upsertRow = async (
  table: string,
  tableColumns: string[],
  rowValues: any[],
  primaryKeyField: string,
  upsertFields: string[],
  { dbInstance }: DatabaseOptions = {},
) => {
  return insertRow(
    table,
    tableColumns,
    rowValues,
    { dbInstance },
    `ON CONFLICT(${primaryKeyField})` +
      ` DO UPDATE SET ${joinTableColumns(
        upsertFields.map((field) => `${field} = excluded.${field}`),
      )}`,
    true,
  );
};

export const updateRow = async (
  table: string,
  tableColumns: string[],
  rowValues: any[],
  primaryKeyField: string,
  primaryKeyValue: any,
  { dbInstance }: DatabaseOptions = {},
) => {
  const { entityName } = tableInfo[table];

  return runWithDb(async (db) => {
    try {
      // Update row in the table
      const result = await db.runAsync(
        `UPDATE ${table}` +
          ` SET ${joinTableColumns(tableColumns, ' = ?, ')} = ?` +
          ` WHERE ${primaryKeyField} = ?`,
        ...rowValues,
        primaryKeyValue,
      );

      // Successful update
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} updated successfully`,
          },
        };
      }

      return {
        data: {
          success: false,
          messages: `Failed to update ${entityName}`,
        },
      };
    } catch (error) {
      throw new Error(
        `Error updating ${entityName}: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

export const deleteRow = async (
  table: string,
  primaryKeyField: string,
  primaryKeyValue: any,
  { dbInstance }: DatabaseOptions = {},
) => {
  const { entityName } = tableInfo[table];

  return runWithDb(async (db) => {
    try {
      // Delete row from the table
      const result = await db.runAsync(
        `DELETE FROM ${table}` + ` WHERE ${primaryKeyField} = ?`,
        primaryKeyValue,
      );

      // Successful deletion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} deleted successfully`,
          },
        };
      }

      return {
        data: {
          success: false,
          messages: `Failed to delete ${entityName}`,
        },
      };
    } catch (error) {
      throw new Error(
        `Error deleting ${entityName}: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};
