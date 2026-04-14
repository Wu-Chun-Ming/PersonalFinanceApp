import {
    RecurringDay,
    RecurringFrequency,
    TransactionCategoryType,
    TransactionMultiDateProps,
    TransactionType,
    TransactionTypeValue,
} from "@/types";
import { getTransactionSchema, transactionFilterSchema } from "@/validation/transactionSchema";
import { router } from "expo-router";
import { FormikProps } from "formik";
import { useMemo } from "react";
import { useCustomFormik } from "./useAppFormik";
import { useCreateTransaction, useUpdateTransaction } from "./useTransactions";

export interface TransactionFormikProps {
    date: string[];
    type: TransactionTypeValue;
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
    transactionType: TransactionTypeValue = TransactionType.EXPENSE,
    formAction: 'create' | 'update',
    scannedData: TransactionFormikProps[] | null,
    scanNum: number,
    transactionId: number,
    initialTransaction?: TransactionFormikProps,
): { transactionFormik: FormikProps<TransactionFormikProps> } => {
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();

    const transactionFormik = useCustomFormik({
        initialValues: initialTransaction || {
            date: [new Date().toString()],
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
        transformValues: (values: TransactionFormikProps): TransactionMultiDateProps => ({
            ...values,
            date: !values.recurring ? values.date.map((d) => new Date(d)) : null,
            type: transactionType,
            category: values.category as TransactionCategoryType,
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
        onSubmitCallback: (transformedTransactionData: TransactionMultiDateProps) => {
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
                        updatedTransactionData: {
                            ...transformedTransactionData,
                            date: Array.isArray(transformedTransactionData.date) 
                                ? transformedTransactionData.date[0]
                                : transformedTransactionData.date,
                        }
                    });
                    break;
            }
        },
    });

    return {
        transactionFormik,
    };
};

interface TransactionFilterFormikProps {
    date?: string;
    type?: string | TransactionTypeValue | '';
    category?: string | TransactionCategoryType | '';
    amount?: string;
    recurring?: string;
    frequency?: string;
}

export const useTransactionFilterFormik = ({
    date,
    type,
    category,
    amount,
    recurring,
    frequency,
}: TransactionFilterFormikProps) => {
    const transactionFilterFormik = useCustomFormik({
        initialValues: {
            date: date || '',
            type: type || '',
            category: category || '',
            amount: amount || '',
            recurring: recurring || '',
            frequency: frequency || '',
        },
        transformValues: (values) => values,
        validationSchema: transactionFilterSchema,
    });

    return {
        transactionFilterFormik,
    };
}
