import { getDatabaseInstance } from '@/database/init';
import * as SQLite from 'expo-sqlite';

// Custom import
import { TransactionMultiDateProps, TransactionProps } from '@/types';

// Fetch all transaction
export const getTransactions = async (dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

        // Fetch all the data from table
        const result = await db.getAllAsync(`SELECT * FROM transactions`);

        // Successful fetched
        if (result.length > 0) {
            return {
                data: result.map(transaction => ({
                    ...transaction,
                    date: transaction.date ? new Date(transaction.date) : null,
                    recurring: Boolean(transaction.recurring),
                    recurring_frequency: transaction.recurring_frequency ? JSON.parse(transaction.recurring_frequency) : null,
                })) as TransactionProps[],
            };
        }

        // No data fetched
        return {
            data: [],
        };
    } catch (error) {
        throw new Error(`Error fetching data from transactions table: ${(error as Error).message}`);
    }
}

// Fetch specific transaction
export const showTransaction = async (id: number, dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

        // Fetch the data
        const result = await db.getFirstAsync(`SELECT * FROM transactions WHERE id = ?`, id);

        // Successful fetched
        if (result) {
            return {
                data: {
                    ...result,
                    date: result.date ? new Date(result.date) : null,
                    recurring: Boolean(result.recurring),
                    recurring_frequency: result.recurring_frequency ? JSON.parse(result.recurring_frequency) : null,
                } as TransactionProps,
            };
        }

        return {
            data: null,
        };
    } catch (error) {
        throw new Error(`Error fetching transaction: ${(error as Error).message}`);
    }
}

// Store new transaction
export const storeTransaction = async (transaction: TransactionProps, dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

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
        if (result && result.changes > 0) {
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
        throw new Error(`Error creating transaction: ${(error as Error).message}`);
    }
};

export const storeBatchTransactions = async (transaction: TransactionProps | TransactionMultiDateProps, dbInstance?: SQLite.SQLiteDatabase) => {
    const db = dbInstance || (await getDatabaseInstance());

    let result:
        | { data: { success: boolean; messages: string } }
        | undefined;
    await db.withTransactionAsync(async () => {
        // SINGLE / MULTIPLE DATES
        if (transaction.date) {
            const dates = Array.isArray(transaction.date) ? transaction.date : [transaction.date];
            const results = await Promise.all(
                dates.map((date) =>
                    storeTransaction({
                        ...transaction,
                        date,
                    }, db)
                )
            );

            const successCount = results.filter(r => r.data.success).length;
            const failCount = results.length - successCount;

            result = {
                data: {
                    success: failCount === 0,
                    messages: failCount === 0
                        ? `${successCount} transaction${successCount === 1 ? '' : 's'} created successfully`
                        : `${successCount} succeeded, ${failCount} failed to create`,
                },
            };

            return;
        } else {
            // RECURRING
            result = await storeTransaction(transaction as TransactionProps, db);
        }
    });

    if (!result) {
        throw new Error(`Error creating batch transactions`);
    }

    return result;
};

// Update transaction details
export const updateTransaction = async (transaction: TransactionProps, id: number, dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

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
        if (result && result.changes > 0) {
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
        throw new Error(`Error updating transaction: ${(error as Error).message}`);
    }
};

// Delete transaction
export const destroyTransaction = async (id: number, dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

        // Delete the specific transaction
        const result = await db.runAsync(`DELETE FROM transactions WHERE id = ?`, id);

        // Successful deletion
        if (result && result.changes > 0) {
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
        throw new Error(`Error deleting transaction: ${(error as Error).message}`);
    }
}

// Fetch available years from transactions
export const getTransactionYears = async (dbInstance?: SQLite.SQLiteDatabase) => {
    try {
        // Get the database instance
        const db = dbInstance || (await getDatabaseInstance());

        // Query for distinct years
        const result = await db.getAllAsync<{
            year: number;
        }>(`
            SELECT DISTINCT strftime('%Y', date) AS year
            FROM transactions
            WHERE date IS NOT NULL
            ORDER BY year ASC
        `);

        // Return transaction years
        if (result.length > 0) {
            return {
                data: result.map((row) => Number(row.year)),
            };
        }

        // No years found
        return {
            data: [],
        };
    } catch (error) {
        throw new Error(`Error fetching available years from transactions table: ${(error as Error).message}`);
    }
};