import * as SQLite from 'expo-sqlite';

// Custom import
import {
  deleteRow,
  getAllData,
  getRowByPrimaryKey,
  insertRow,
  updateRow,
} from '@/database';
import { DatabaseOptions, InvestmentProps } from '@/types';
import { investmentTableColumns } from './schema';

const getInvestmentValues = (investment: InvestmentProps) => {
  return [
    investment.accountId,
    investment.name,
    investment.type,
    investment.value,
    investment.currency,
  ];
};

// Fetch all investments
export const getInvestments = async ({ dbInstance }: DatabaseOptions = {}) => {
  return getAllData<InvestmentProps>('investments', { dbInstance });
};

// Fetch specific investment
export const showInvestment = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return getRowByPrimaryKey<InvestmentProps>('investments', 'id', id, {
    dbInstance,
  });
};

// Store new investment
export const storeInvestment = async (
  investment: InvestmentProps,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return insertRow(
    'investments',
    preserveId
      ? investmentTableColumns.slice(0, -1)
      : investmentTableColumns.slice(1, -1), // Exclude 'id' column for insertion if not preserving
    [
      ...(preserveId ? [investment.id] : []),
      ...getInvestmentValues(investment),
    ],
    { dbInstance },
  );
};

// Update investment details
export const updateInvestment = async (
  investment: InvestmentProps,
  id: number,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return updateRow(
    'investments',
    preserveId ? investmentTableColumns : investmentTableColumns.slice(1), // Exclude 'id' column for update if not preserving
    [
      ...(preserveId ? [investment.id] : []),
      ...getInvestmentValues(investment),
      new Date().toISOString(),
    ],
    'id',
    id,
    { dbInstance },
  );
};

// Delete investment
export const destroyInvestment = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return deleteRow('investments', 'id', id, { dbInstance });
};
