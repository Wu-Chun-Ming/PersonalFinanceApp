import * as SQLite from 'expo-sqlite';

import { getAllData, upsertRow } from '@/database';
import { BudgetProps, DatabaseOptions } from '@/types';
import { budgetTableColumns } from './schema';

const transformBudget = (budget: any): BudgetProps => {
  return {
    ...budget,
    amount: budget.amount / 100,
  };
};

// Fetch budgets
export const getBudgets = async (options?: DatabaseOptions) => {
  return getAllData<BudgetProps>('budgets', options, transformBudget);
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
    [year, month, category, amount * 100], // Convert to cents
    'year, month, category',
    ['amount'],
    { dbInstance },
  );
};
