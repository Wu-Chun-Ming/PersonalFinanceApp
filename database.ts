import * as SQLite from 'expo-sqlite';

// Custom import
import { TransactionProps } from '@/constants/Types';

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
Table: Transactions
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
currency                VARCHAR
============================================================
*/

// Initialise database
export const initializeDatabase = async () => {
    try {
        // Get db instance
        const db = await getDatabaseInstance();

        // Create the table
        await db.runAsync(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT, 
                date TEXT,
                category TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
                recurring INTEGER NOT NULL CHECK(recurring IN (0, 1)),
            );
        `);
    } catch (error) {
        throw new Error(`Error creating the database or table: ${error}`);
    }
}

/*
============================================================
General Operations
============================================================
*/

// Get all rows from specified table
export const getAllRows = async (tableName: string) => {
    try {
        // Get the database instance
        const db = await getDatabaseInstance();

        // Fetch all the data from table
        const result = await db.getAllAsync(`SELECT * FROM ${tableName}`);

        // Successful fetched
        if (result.length > 0) {
            return {
                success: true,
                data: result,
            };
        }

        // No rows fetched
        return {
            success: false,
            data: null,
        };
    } catch (error) {
        throw new Error(`Error fetching items from ${tableName}: ${error}`);
    }
};

/*
============================================================
Table-specified Operations
============================================================
*/

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
                success: true,
                data: result,
            };
        }

        return {
            success: false,
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
            'INSERT INTO transactions (date, type, category, amount, description, recurring) VALUES (?, ?, ?, ?, ?, ?)',
            transaction.date.toString(),
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction?.description,
            transaction.recurring ? 1 : 0,
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
            'UPDATE transactions SET date = ?, type = ?, category = ?, amount = ?, description = ?, recurring = ? WHERE id = ?',
            transaction.date.toString(),
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction?.description,
            transaction.recurring ? 1 : 0,
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
