import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    RECURRING_DAYS,
    RECURRING_FREQUENCIES,
    TRANSACTION_TYPES,
} from '@/constants/transaction';
import {
    RecurringFrequency,
    TransactionType,
    TransactionTypeValue,
} from '@/types';
import { getCategoriesByTransactionType } from '@/utils/category';
import * as Yup from 'yup';

export const transactionFilterSchema = Yup.object().shape({
    date: Yup.date()
        .optional(),
    type: Yup.string()
        .oneOf(TRANSACTION_TYPES)
        .optional(),
    category: Yup.string()
        .when('type', (transactionType: any, schema) => {
            if (transactionType === TransactionType.EXPENSE) {
                return schema
                    .oneOf(EXPENSE_CATEGORIES, 'Invalid Category')
                    .optional();
            }
            if (transactionType === TransactionType.INCOME) {
                return schema
                    .oneOf(INCOME_CATEGORIES, 'Invalid Category')
                    .optional();
            }
            return schema.optional();
        }),
    amount: Yup.number()
        .typeError("Must be a number")
        .positive('Amount must be positive')
        .optional(),
    recurring: Yup.boolean()
        .optional(),
    frequency: Yup.string()
        .oneOf(RECURRING_FREQUENCIES)
        .optional(),
});

export const getTransactionSchema = (transactionType: TransactionTypeValue) => Yup.object().shape({
    date: Yup.date()
        .when(['recurring'], ([recurring], schema) => {
            return recurring === false
                ? schema.required('Date is required')
                : schema.notRequired();
        }),
    type: Yup.string()
        .oneOf(TRANSACTION_TYPES, 'Invalid type')
        .required('Transaction type is required'),
    category: Yup.string()
        .oneOf(getCategoriesByTransactionType(transactionType), 'Invalid Category')
        .required('Category is required'),
    amount: Yup.number().typeError("Must be a number")
        .positive('Amount must be positive')
        .required('Amount is required'),
    description: Yup.string()
        .required('Description is required'),
    recurring: Yup.boolean(),
    recurring_frequency: Yup.object().shape({
        frequency: Yup.string()
            .oneOf(RECURRING_FREQUENCIES, 'Invalid frequency')
            .when('$recurring', ([recurring], schema) => {
                return recurring === true
                    ? schema.required('Frequency is required')
                    : schema.notRequired();
            }),
        time: Yup.object().shape({
            month: Yup.string()
                .when('$recurring_frequency.frequency', ([frequency], schema) => {
                    return (frequency === RecurringFrequency.YEARLY)
                        ? schema.required('Month is required')
                        : schema.notRequired();
                }),
            date: Yup.string(),
            day: Yup.string()
                .oneOf(RECURRING_DAYS, 'Invalid day')
                .when('$recurring_frequency.frequency', ([frequency], schema) => {
                    return frequency === RecurringFrequency.WEEKLY
                        ? schema.required('Day is required')
                        : schema.notRequired();
                }),
        }).test(
            'monthly-day-or-date',
            'Either day or date must be provided',
            function (value) {
                const frequency = this.options.context?.recurring_frequency?.frequency;
                if (frequency === RecurringFrequency.MONTHLY) {
                    return !!(value?.day || value?.date);
                }
                return true;
            }
        ),
    })
});