import { TransactionProps } from "@/constants/Types";
import {
    destroyTransaction,
    getTransactions,
    showTransaction,
    storeTransaction,
    updateTransaction,
} from "@/database/transactionDatabase";
import { RRule } from 'rrule';

// Fetch transactions
export const fetchTransactions = async () => {
    const response = await getTransactions();
    return response.data;
};

// Fetch single transaction
export const fetchTransaction = async (id: number) => {
    const response = await showTransaction(id);
    return response.data;
};

// Create transaction
export const createTransaction = async (newTransactionData: TransactionProps) => {
    const response = await storeTransaction(newTransactionData);
    return response.data;
}

// Edit transaction
export const editTransaction = async (id: number, updatedTransactionData: TransactionProps) => {
    const response = await updateTransaction(updatedTransactionData, id);
    return response.data;
};

// Delete transaction
export const deleteTransaction = async (id: number) => {
    const response = await destroyTransaction(id);
    return response.data;
};

// Add transaction(s) based on recurring transactions in the database
export const handleRecurringTransactions = async (
    lastOpenDate: Date,
) => {
    const transactions = await fetchTransactions();
    const recurringTransactions = transactions.filter(t => t.recurring);
    if (recurringTransactions.length === 0) return;

    const todayDateObj = new Date();
    if (
        lastOpenDate.getFullYear() === todayDateObj.getFullYear()
        && lastOpenDate.getMonth() === todayDateObj.getMonth()
        && lastOpenDate.getDate() === todayDateObj.getDate()
    ) return;

    try {
        let lastOpenDateObj = new Date(lastOpenDate.getTime());
        lastOpenDateObj.setDate(lastOpenDateObj.getDate() + 1);     // Exclude last open date

        if (lastOpenDateObj < todayDateObj) {
            // Format to `YYYYMMDDTHHmmss`
            const lastOpenDate = lastOpenDateObj.toISOString().replace(/[-:]/g, '').split('.')[0];
            const today = todayDateObj.toISOString().replace(/[-:]/g, '').split('.')[0];
            for (const transaction of recurringTransactions) {
                if (!transaction.recurring_frequency) continue;
                const { frequency: freq, time } = transaction.recurring_frequency;
                const { month, day, date } = time;

                // Construct RRule string
                let rruleStr = `DTSTART:${lastOpenDate}\nRRULE:`;
                if (freq) rruleStr += `FREQ=${freq};`;
                if (month) rruleStr += `BYMONTH=${month};`;
                if (day) rruleStr += `BYDAY=${day};`;
                if (date) rruleStr += `BYMONTHDAY=${date};`;
                rruleStr += `UNTIL=${today}`

                // Generate dates using RRule
                const rule = RRule.fromString(rruleStr);
                // Create transactions for each generated date
                for (const recurringDate of rule.all()) {
                    await createTransaction({
                        ...transaction,
                        date: recurringDate,
                        recurring: false,
                        recurring_frequency: null,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error updating recurring transactions:', (error as Error).message);
    }
};