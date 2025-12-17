import {
    destroyTransaction,
    getTransactions,
    showTransaction,
    storeTransaction,
    updateTransaction,
} from "@/database/transactionDatabase";
import { TransactionProps } from "@/types";
import { Parser } from '@json2csv/plainjs';
import { csv } from 'csvtojson';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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

// Export all transactions
export const exportAllTransactions = async (fileType: 'json' | 'csv') => {
    const { data: allTransactions } = await getTransactions();
    // Check if there is transaction data to export
    if (allTransactions.length === 0) {
        return {
            success: false,
            messages: 'No transaction data to export.'
        }
    }

    let transactionData;
    // Prepare data based on file type
    if (fileType === 'json') {
        // JSON data
        transactionData = JSON.stringify(allTransactions, null, 2);
    } else if (fileType === 'csv') {
        // CSV data
        const parser = new Parser();
        transactionData = parser.parse(allTransactions);
    } else {
        throw new Error('Unsupported file type for export.');
    }

    try {
        // Ask user to pick a folder
        const folderUri = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!folderUri.granted) {
            return {
                success: false,
                messages: 'Permission to access storage was denied.'
            }
        }

        const filename = 'exported_transactions.' + fileType;
        const mimeType = (fileType === 'json') ? 'application/json' : 'text/csv';
        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            folderUri.directoryUri,
            filename,
            mimeType
        );

        // Write the file
        await FileSystem.StorageAccessFramework.writeAsStringAsync(fileUri, transactionData, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        // Make sure the file exists
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
            throw new Error('File was not created successfully.');
        }

        // Return success message
        return {
            success: true,
            messages: `Transaction data exported successfully as ${filename}`
        }
    } catch (error) {
        throw new Error(`Error exporting transactions: ${(error as Error).message}`);
    }
}

// Import transactions from file
export const importTransactions = async (fileType: 'json' | 'csv') => {
    // Let user pick a file
    const result = await DocumentPicker.getDocumentAsync({
        type: fileType === 'json' ? 'application/json' : 'text/comma-separated-values',
        copyToCacheDirectory: true,
    });

    // If user picked a file
    if (!result.canceled) {
        // Read the file content
        const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        let transactionData;
        // Parse the file content based on file type
        try {
            if (fileType === 'json') {
                transactionData = JSON.parse(fileContent);
            } else if (fileType === 'csv') {
                transactionData = await csv().fromString(fileContent);
            }
        } catch (error) {
            throw new Error(`Error parsing ${fileType.toUpperCase()} file: ${(error as Error).message}`);
        }

        // Store each transaction entry
        for (const transaction of transactionData) {
            await storeTransaction(transaction);
        }

        return {
            success: true,
            messages: `Imported ${transactionData.length} transactions from ${fileType.toUpperCase()} file.`
        };
    } else {
        return {
            success: false,
            messages: 'File selection was canceled.'
        };
    }
}

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