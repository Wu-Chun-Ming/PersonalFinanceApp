import { RecurringDay, RecurringFrequency, TransactionCategory, TransactionType } from "@/constants/Types";
import { getTransactionSchema, transactionSchema } from "@/validation/transactionSchema";
import { router } from "expo-router";
import { useMemo } from "react";
import { useCustomFormik } from "./useAppFormik";
import { useCreateTransaction, useUpdateTransaction } from "./useTransactions";

interface TransactionFormikProps {
    date: string;
    type: TransactionType;
    category: string;
    amount: string;
    description: string;
    recurring: boolean;
    recurring_frequency: {
        frequency: string;
        time: {
            month: string;
            date: string;
            day: string;
        };
    };
}

export const useTransactionFormik = (
    transactionType: TransactionType = TransactionType.EXPENSE,
    formAction: 'create' | 'update',
    scannedData: TransactionFormikProps[],
    scanNum: number,
    transactionId: number,
    initialTransaction?: TransactionFormikProps,
) => {
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    const transactionFormik = useCustomFormik({
        initialValues: initialTransaction || {
            date: new Date().toString(),
            type: TransactionType.EXPENSE,
            category: '',
            amount: '',
            description: '',
            recurring: false,
            recurring_frequency: {
                frequency: '',
                time: {
                    month: '',
                    date: '',
                    day: '',
                },
            },
        },
        validationSchema: useMemo(
            () => getTransactionSchema(transactionType),
            [transactionType]
        ),
        transformValues: (values) => ({
            ...values,
            date: !values.recurring ? new Date(values.date) : null,
            type: transactionType,
            category: values.category as TransactionCategory,
            amount: Number(values.amount),
            recurring_frequency: values.recurring
                ? {
                    frequency: values.recurring_frequency.frequency as RecurringFrequency,
                    time: {
                        month: Number(values.recurring_frequency.time.month) || null,
                        date: Number(values.recurring_frequency.time.date) || null,
                        day: values.recurring_frequency.time.day as RecurringDay || null,
                    },
                } : null,
        }),
        onSubmitCallback: (transformedTransactionData) => {
            switch (formAction) {
                case 'create':
                    createMutation.mutate(transformedTransactionData);
                    // Remove current scanned data from pending transactions
                    if (scannedData && scannedData[scanNum]) {
                        scannedData.splice(scanNum, 1);
                        if (scannedData.length === 0) {
                            router.dismiss(1);
                            router.replace('/');
                        }
                    }
                    break;
                case 'update':
                    updateMutation.mutate({
                        id: Number(transactionId),
                        updatedTransactionData: transformedTransactionData
                    });
                    break;
            }
        },
    });

    return {
        transactionFormik,
    };
};

interface FilteredTransactionFormikProps {
    date?: string;
    type?: string | TransactionType | '';
    category?: string | TransactionCategory | '';
    amount?: string;
    recurring?: string;
    frequency?: string;
}

export const useFilteredTransactionsFormik = ({
    date,
    type,
    category,
    amount,
    recurring,
    frequency,
}: FilteredTransactionFormikProps) => {
    const filteredTxFormik = useCustomFormik({
        initialValues: {
            date: date || '',
            type: type || '',
            category: category || '',
            amount: amount || '',
            recurring: recurring || '',
            frequency: frequency || '',
        },
        transformValues: (values) => values,
        validationSchema: transactionSchema,
    });

    return {
        filteredTxFormik,
    };
}
