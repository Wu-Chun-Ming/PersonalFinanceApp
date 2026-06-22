import {
  EXPENSE_CATEGORIES,
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from '@/constants/transaction';
import { AccountType, InvestmentType } from '@/types';

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
        category TEXT NOT NULL CHECK(category IN (${allowedTransactionCategories})),
        amount REAL NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN (${allowedTransactionTypes})),
        recurring INTEGER NOT NULL CHECK(recurring IN (0, 1)),
        recurring_frequency TEXT,
        accountId INTEGER NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts(id)
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

// Define allowed values for budget categories
const allowedBudgetCategories = EXPENSE_CATEGORIES.map(
  (category) => `'${category}'`,
).join(', ');

export const budgetTableSchema = `
    CREATE TABLE IF NOT EXISTS budgets (
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        category TEXT NOT NULL CHECK(category IN (${allowedBudgetCategories})),
        amount REAL NOT NULL DEFAULT 0.0,
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

const allowedAccountTypes = Object.values(AccountType)
  .map((type) => `'${type}'`)
  .join(', ');

export const accountTableSchema = `
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN (${allowedAccountTypes})),
        balance REAL NOT NULL DEFAULT 0.0,
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

const allowedInvestmentTypes = Object.values(InvestmentType)
  .map((type) => `'${type}'`)
  .join(', ');

export const investmentTableSchema = `
    CREATE TABLE IF NOT EXISTS investments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        accountId INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN (${allowedInvestmentTypes})),
        value REAL NOT NULL DEFAULT 0.0,
        currency TEXT NOT NULL,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
    );
`;
