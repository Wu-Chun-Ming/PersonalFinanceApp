import * as SQLite from 'expo-sqlite';

// Custom import
import { runWithDb } from '@/database/init';
import { DatabaseOptions, InvestmentProps } from '@/types';
import {
  generateTablePlaceholders,
  investmentTableColumns,
  joinTableColumns,
} from './schema';

const getInvestmentValues = (investment: InvestmentProps) => {
  return [
    investment.accountId,
    investment.name,
    investment.type,
    investment.value,
    investment.currency,
    new Date().toISOString(),
  ];
};

// Fetch all investments
export const getInvestments = async ({ dbInstance }: DatabaseOptions = {}) => {
  return runWithDb(async (db) => {
    try {
      // Fetch all the data from table
      const result: InvestmentProps[] = await db.getAllAsync(
        `SELECT * FROM investments`,
      );

      // Successful fetched
      if (result.length > 0) {
        return {
          data: result,
        };
      }

      // No data fetched
      return {
        data: [],
      };
    } catch (error) {
      throw new Error(
        `Error fetching data from investments table: ${(error as Error).message}`,
      );
    }
  }, dbInstance);
};

// Fetch specific investment
export const showInvestment = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Fetch the data
      const result: InvestmentProps | null = await db.getFirstAsync(
        `SELECT * FROM investments WHERE id = ?`,
        id,
      );

      // Successful fetched
      if (result) {
        return {
          data: result,
        };
      }

      return {
        data: null,
      };
    } catch (error) {
      throw new Error(`Error fetching investment: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Store new investment
export const storeInvestment = async (
  investment: InvestmentProps,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Insert the investment
      const result = await db.runAsync(
        `INSERT INTO investments (${joinTableColumns(investmentTableColumns.slice(1))}) 
          VALUES (${generateTablePlaceholders(investmentTableColumns.length - 1)})
        `,
        ...getInvestmentValues(investment),
      );

      // Successful insertion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Investment created successfully',
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to create investment',
        },
      };
    } catch (error) {
      throw new Error(`Error creating investment: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Update investment details
export const updateInvestment = async (
  investment: InvestmentProps,
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Update the investment
      const result = await db.runAsync(
        `UPDATE investments SET ${joinTableColumns(investmentTableColumns.slice(1), ' = ?, ')} = ? WHERE id = ?`,
        ...getInvestmentValues(investment),
        id,
      );

      // Successful update
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Investment updated successfully',
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to update investment',
        },
      };
    } catch (error) {
      throw new Error(`Error updating investment: ${(error as Error).message}`);
    }
  }, dbInstance);
};

// Delete investment
export const destroyInvestment = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return runWithDb(async (db) => {
    try {
      // Delete the specific investment
      const result = await db.runAsync(
        `DELETE FROM investments WHERE id = ?`,
        id,
      );

      // Successful deletion
      if (result && result.changes > 0) {
        return {
          data: {
            success: true,
            messages: 'Investment deleted successfully',
          },
        };
      }

      return {
        data: {
          success: false,
          messages: 'Failed to delete investment',
        },
      };
    } catch (error) {
      throw new Error(`Error deleting investment: ${(error as Error).message}`);
    }
  }, dbInstance);
};
