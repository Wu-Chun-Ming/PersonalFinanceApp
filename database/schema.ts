import { ACCOUNT_TYPES } from '@/constants/account';
import { INVESTMENT_TYPES } from '@/constants/investment';
import {
  EXPENSE_CATEGORIES,
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from '@/constants/transaction';
import { TableInfoProps } from '@/types';

export const tableInfo: TableInfoProps = {
  transactions: {
    entityName: 'transaction',
  },
  transfers: {
    entityName: 'transfer',
  },
  budgets: {
    entityName: 'budget',
  },
  accounts: {
    entityName: 'account',
  },
  investments: {
    entityName: 'investment',
  },
};

export const joinTableColumns = (
  columns: string[],
  separator: string = ', ',
) => {
  return columns.join(separator);
};

export const generateTablePlaceholders = (count: number) => {
  return '?, '.repeat(count - 1) + '?';
};

/* 
Table: transactions
============================================================
Column Name             Intended Type
============================================================
id                      INTEGER
date                    DATE (YYYY-MM-DD) | null
type                    ENUM('expense', 'income')
category                ENUM(...)
amount                  DOUBLE
description             VARCHAR
recurring               BOOLEAN
recurring_frequency     JSON { frequency, time: { month, day, date }} | null
currency                VARCHAR
============================================================
*/

export const transactionTableColumns = [
  'id',
  'date',
  'type',
  'category',
  'amount',
  'description',
  'recurring',
  'recurring_frequency',
  'accountId',
];

// Define allowed values for transaction types and categories
const allowedTransactionTypes = TRANSACTION_TYPES.map(
  (type) => `'${type}'`,
).join(', ');
const allowedTransactionCategories = TRANSACTION_CATEGORIES.map(
  (category) => `'${category}'`,
).join(', ');

export const transactionTableSchema = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        date TEXT,
        type TEXT NOT NULL CHECK(type IN (${allowedTransactionTypes})),
        category TEXT NOT NULL CHECK(category IN (${allowedTransactionCategories})),
        amount INTEGER NOT NULL,
        description TEXT,
        recurring INTEGER NOT NULL CHECK(recurring IN (0, 1)),
        recurring_frequency TEXT,
        accountId INTEGER NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts(id)
    );
`;

/*
Table: transfers
============================================================
Column Name             Intended Type
============================================================
id                      INTEGER
fromAccountId           INTEGER
toAccountId             INTEGER
amount                  DOUBLE
currency                VARCHAR
date                    DATE (YYYY-MM-DD)
description             VARCHAR
*/

export const transferTableColumns = [
  'id',
  'date',
  'fromAccountId',
  'toAccountId',
  'amount',
  'description',
  'currency',
];

export const transfersTableSchema = `
    CREATE TABLE IF NOT EXISTS transfers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        fromAccountId INTEGER NOT NULL,
        toAccountId INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        description TEXT,
        currency TEXT NOT NULL,
        FOREIGN KEY (fromAccountId) REFERENCES accounts(id) ON DELETE CASCADE,
        FOREIGN KEY (toAccountId) REFERENCES accounts(id) ON DELETE CASCADE
    );
`;

/* 
Table: budgets
============================================================
Column Name             Type
============================================================
year                    INTEGER
month                   INTEGER
category                ENUM(...)
amount                  DOUBLE
============================================================
*/

export const budgetTableColumns = ['year', 'month', 'category', 'amount'];

// Define allowed values for budget categories
const allowedBudgetCategories = EXPENSE_CATEGORIES.map(
  (category) => `'${category}'`,
).join(', ');

export const budgetTableSchema = `
    CREATE TABLE IF NOT EXISTS budgets (
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        category TEXT NOT NULL CHECK(category IN (${allowedBudgetCategories})),
        amount INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY (year, month, category)
    );
`;

/* 
Table: accounts
============================================================
Column Name             Type
============================================================
id                      INTEGER
name                    VARCHAR
type                    ENUM(...)
balance                 DOUBLE
currency                VARCHAR
earnReturns             BOOLEAN
updated_at              DATETIME
============================================================
*/

export const accountTableColumns = [
  'id',
  'name',
  'type',
  'balance',
  'currency',
  'earnReturns',
  'updated_at',
];

const allowedAccountTypes = ACCOUNT_TYPES.map((type) => `'${type}'`).join(', ');

export const accountTableSchema = `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN (${allowedAccountTypes})),
        balance INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL,
        earnReturns INTEGER NOT NULL CHECK(earnReturns IN (0, 1)),
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
`;

/* 
Table: investments
============================================================
Column Name             Type
============================================================
id                      INTEGER
accountId               INTEGER
name                    VARCHAR
type                    ENUM(...)
value                   DOUBLE
currency                VARCHAR
updated_at              DATETIME
============================================================
*/

export const investmentTableColumns = [
  'id',
  'accountId',
  'name',
  'type',
  'value',
  'currency',
  'updated_at',
];

const allowedInvestmentTypes = INVESTMENT_TYPES.map((type) => `'${type}'`).join(
  ', ',
);

export const investmentTableSchema = `
    CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountId INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN (${allowedInvestmentTypes})),
        value INTEGER NOT NULL,
        currency TEXT NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
    );
`;
