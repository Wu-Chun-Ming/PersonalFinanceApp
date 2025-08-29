import * as SQLite from 'expo-sqlite';

// Custom import
import { BudgetProps, EXPENSE_CATEGORIES, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';

let dbInstance: SQLite.SQLiteDatabase | null = null; // To store the singleton instance

// Open local database
export const getDatabaseInstance = async () => {
    try {
        if (!dbInstance) {              // Open the database if no instance exists
            dbInstance = await SQLite.openDatabaseAsync('localDatabase.db');
        }
        return dbInstance;              // Return the existing or newly created instance
    } catch (error) {
        throw new Error(`Error opening database: ${error}`);
    }
};

/* 
Table: transactions
============================================================
Column Name             Type
============================================================
id                      INTEGER
date                    DATE            // YYYY-MM-DD
type                    ENUM('expense', 'income')
category                ENUM(...)
amount                  DOUBLE
description             VARCHAR
recurring               BOOLEAN
recurring_frequency     JSON { frequency, time: { month, day, date }}
currency                VARCHAR
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

// Initialise database
export const initializeDatabase = async () => {
    try {
        // Get db instance
        const db = await getDatabaseInstance();

        // Define allowed values for transaction types and categories
        const allowedTransactionTypes = Object.values(TransactionType).map(type => `'${type}'`).join(', ');
        const allowedTransactionCategories = Object.values(TransactionCategory).map(category => `'${category}'`).join(', ');
        // Define allowed values for budget categories
        const allowedBudgetCategories = EXPENSE_CATEGORIES.map(category => `'${category}'`).join(', ');

        // Create the tables
        await db.execAsync(`
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
            CREATE TABLE IF NOT EXISTS budgets (
                year INTEGER NOT NULL,
                month INTEGER NOT NULL,
                category TEXT NOT NULL CHECK(category IN (${allowedBudgetCategories})),
                amount REAL NOT NULL DEFAULT 0.0,
                PRIMARY KEY (year, month, category)
            );
        `);
        // Initialize budgets table with default budgets for current year andmonth
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const values = EXPENSE_CATEGORIES.flatMap((category) => [
            currentYear, currentMonth, category, 0.0
        ]);
        const placeholders = EXPENSE_CATEGORIES.map(() => '(?, ?, ?, ?)').join(', ');
        await db.runAsync(`
            INSERT OR REPLACE INTO budgets (year, month, category, amount) VALUES ${placeholders}`,
            values
        );
    } catch (error) {
        throw new Error(`Error creating the database or table: ${error}`);
    }
}

// Fetch all transaction
export const getTransactions = async () => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Fetch all the data from table
        const result = await db.getAllAsync(`SELECT * FROM transactions`);

        // Successful fetched
        if (result.length > 0) {
            return {
                data: result as TransactionProps[],
            };
        }

        // No data fetched
        return {
            data: null,
        };
    } catch (error) {
        throw new Error(`Error fetching data from transactions table: ${error}`);
    }
}

// Fetch specific transaction
export const showTransaction = async (id: number) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Fetch the data
        const result = await db.getFirstAsync(`SELECT * FROM transactions WHERE id = ${id}`);

        // Successful fetched
        if (result) {
            return {
                data: result as TransactionProps,
            };
        }

        return {
            data: null,
        };
    } catch (error) {
        throw new Error(`Error fetching transaction: ${error}`);
    }
}

// Store new transaction
export const storeTransaction = async (transaction: TransactionProps) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Insert the transaction
        const result = await db.runAsync(
            'INSERT INTO transactions (date, type, category, amount, description, recurring, recurring_frequency) VALUES (?, ?, ?, ?, ?, ?, ?)',
            transaction.date ? transaction.date.toString() : null,
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction?.description,
            transaction.recurring ? 1 : 0,
            JSON.stringify(transaction.recurring_frequency),
        );

        // Successful insertion
        if (result) {
            return {
                data: {
                    success: true,
                    messages: 'Transaction created successfully',
                }
            };
        }

        return {
            data: {
                success: false,
                messages: 'Failed to create transaction',
            }
        };
    } catch (error) {
        throw new Error(`Error creating transaction: ${error}`);
    }
};

// Update transaction details
export const updateTransaction = async (transaction: TransactionProps, id: number) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Update the transaction
        const result = await db.runAsync(
            'UPDATE transactions SET date = ?, type = ?, category = ?, amount = ?, description = ?, recurring = ?, recurring_frequency = ? WHERE id = ?',
            transaction.date ? transaction.date.toString() : null,
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction?.description,
            transaction.recurring ? 1 : 0,
            JSON.stringify(transaction.recurring_frequency),
            id
        );

        // Successful update
        if (result) {
            return {
                data: {
                    success: true,
                    messages: 'Transaction updated successfully',
                }
            };
        }

        return {
            data: {
                success: false,
                messages: 'Failed to update transaction',
            }
        };
    } catch (error) {
        throw new Error(`Error updating transaction: ${error}`);
    }
};

// Delete transaction
export const destroyTransaction = async (id: number) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Delete the specific transaction
        const result = await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);

        // Successful deletion
        if (result) {
            return {
                data: {
                    success: true,
                    messages: 'Transaction deleted successfully',
                }
            };
        }

        return {
            data: {
                success: false,
                messages: 'Failed to delete transaction',
            }
        };
    } catch (error) {
        throw new Error(`Error deleting transaction: ${error}`);
    }
}


// Fetch budgets
export const getBudgets = async () => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Fetch all the data from table
        const result = await db.getAllAsync(`SELECT * FROM budgets`);

        // Successful fetched
        if (result.length > 0) {
            return {
                data: result as BudgetProps[],
            };
        }

        // No data fetched
        return {
            data: null,
        };
    } catch (error) {
        throw new Error(`Error fetching data from budgets table: ${error}`);
    }
}

// Update budget amount
export const updateBudget = async (amount: number, { year, month, category }: { year: number; month: number; category: string }) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Update the budget
        const result = await db.runAsync(
            'UPDATE budgets SET amount = ? WHERE year = ? AND month = ? AND category = ?',
            amount,
            year,
            month,
            category,
        );

        // Successful update
        if (result) {
            return {
                data: {
                    success: true,
                    messages: 'Budget updated successfully',
                }
            };
        }

        return {
            data: {
                success: false,
                messages: 'Failed to update budget',
            }
        };
    } catch (error) {
        throw new Error(`Error updating budget: ${error}`);
    }
}
