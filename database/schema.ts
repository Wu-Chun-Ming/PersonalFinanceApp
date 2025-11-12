import {
    EXPENSE_CATEGORIES,
    TransactionCategory,
    TransactionType,
} from "@/constants/Types";

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
const allowedTransactionTypes = Object.values(TransactionType).map(type => `'${type}'`).join(', ');
const allowedTransactionCategories = Object.values(TransactionCategory).map(category => `'${category}'`).join(', ');

export const transactionTableSchema = `
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        date TEXT,
        category TEXT NOT NULL CHECK(category IN (${allowedTransactionCategories})),
        amount REAL NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK(type IN (${allowedTransactionTypes})),
        recurring INTEGER NOT NULL CHECK(recurring IN (0, 1)),
        recurring_frequency TEXT
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
const allowedBudgetCategories = EXPENSE_CATEGORIES.map(category => `'${category}'`).join(', ');

export const budgetTableSchema = `
    CREATE TABLE IF NOT EXISTS budgets (
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        category TEXT NOT NULL CHECK(category IN (${allowedBudgetCategories})),
        amount REAL NOT NULL DEFAULT 0.0,
        PRIMARY KEY (year, month, category)
    );
`;