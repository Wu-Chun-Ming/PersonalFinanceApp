import * as SQLite from 'expo-sqlite';

// Custom import
import {
  deleteRow,
  getAllData,
  getRowByPrimaryKey,
  insertRow,
  updateRow,
  upsertRow,
} from '@/database';
import { AccountProps, DatabaseOptions } from '@/types';
import { accountTableColumns } from './schema';

const getAccountValues = (account: AccountProps) => {
  return [
    account.name,
    account.type,
    account.balance,
    account.currency,
    account.earnReturns,
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
  return getAllData<AccountProps>('accounts', { dbInstance }, transformAccount);
};

// Fetch specific account
export const showAccount = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return getRowByPrimaryKey<AccountProps>(
    'accounts',
    'id',
    id,
    { dbInstance },
    transformAccount,
  );
};

// Store new account
export const storeAccount = async (
  account: AccountProps,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return insertRow(
    'accounts',
    preserveId
      ? accountTableColumns.slice(0, -1)
      : accountTableColumns.slice(1, -1), // Exclude 'id' column for insertion if not preserving
    [...(preserveId ? [account.id] : []), ...getAccountValues(account)],
    {
      dbInstance,
    },
  );
};

// Upsert account (insert or update)
export const upsertAccount = async (
  account: AccountProps,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return upsertRow(
    'accounts',
    accountTableColumns,
    [account.id, ...getAccountValues(account)],
    'id',
    accountTableColumns.slice(1),
    {
      dbInstance,
    },
  );
};

// Update account details
export const updateAccount = async (
  account: AccountProps,
  id: number,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return updateRow(
    'accounts',
    preserveId ? accountTableColumns : accountTableColumns.slice(1), // Exclude 'id' column for update if not preserving
    [
      ...(preserveId ? [account.id] : []),
      ...getAccountValues(account),
      new Date().toISOString(),
    ],
    'id',
    id,
    { dbInstance },
  );
};

// Delete account and its associated transactions
export const destroyAccount = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return deleteRow('accounts', 'id', id, { dbInstance });
};
