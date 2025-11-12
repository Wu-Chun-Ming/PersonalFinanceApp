import { BudgetProps } from '@/constants/Types';
import { getDatabaseInstance } from '@/database/init';
import * as SQLite from 'expo-sqlite';

// Fetch budgets
export const getBudgets = async (dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

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
            data: [],
        };
    } catch (error) {
        throw new Error(`Error fetching data from budgets table: ${(error as Error).message}`);
    }
}

// Update budget amount
export const updateBudget = async (amount: number, { year, month, category }: { year: number; month: number; category: string }, dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

        // Update the budget
        const result = await db.runAsync(`
            INSERT INTO budgets (year, month, category, amount) VALUES (?, ?, ?, ?) ON CONFLICT(year, month, category) DO UPDATE SET amount = excluded.amount;
            `,
            year,
            month,
            category,
            amount
        );

        // Successful update
        if (result && result.changes > 0) {
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
        throw new Error(`Error updating budget: ${(error as Error).message}`);
    }
}
