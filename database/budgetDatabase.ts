import * as SQLite from 'expo-sqlite';

import { getAllData, upsertRow } from '@/database';
import { BudgetProps } from '@/types';
import { budgetTableColumns } from './schema';

// Fetch budgets
export const getBudgets = async (dbInstance?: SQLite.SQLiteDatabase) => {
  return getAllData<BudgetProps>('budgets', { dbInstance });
};

// Update budget amount
export const updateBudget = async (
  amount: number,
  { year, month, category }: { year: number; month: number; category: string },
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return upsertRow(
    'budgets',
    budgetTableColumns,
    [year, month, category, amount],
    'year, month, category',
    ['amount'],
    { dbInstance },
  );
};
