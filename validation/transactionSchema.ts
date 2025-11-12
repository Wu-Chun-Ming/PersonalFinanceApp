import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurringDay, RecurringFrequency, TransactionType } from '@/constants/Types';
import * as Yup from 'yup';

export const transactionSchema = Yup.object().shape({
    date: Yup.date()
        .optional(),
    type: Yup.string()
        .oneOf(Object.values(TransactionType))
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
        .oneOf(Object.values(RecurringFrequency))
        .optional(),
});

export const getTransactionSchema = (transactionType: TransactionType) => Yup.object().shape({
    date: Yup.date()
        .when(['recurring'], ([recurring], schema) => {
            return recurring === false
                ? schema.required('Date is required')
                : schema.notRequired();
        }),
    type: Yup.string()
        .oneOf(Object.values(TransactionType), 'Invalid type')
        .required('Transaction type is required'),
    category: Yup.string()
        .oneOf((transactionType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES), 'Invalid Category')
        .required('Category is required'),
    amount: Yup.number().typeError("Must be a number")
        .positive('Amount must be positive')
        .required('Amount is required'),
    description: Yup.string()
        .required('Description is required'),
    recurring: Yup.boolean(),
    recurring_frequency: Yup.object().shape({
        frequency: Yup.string()
            .oneOf(Object.values(RecurringFrequency), 'Invalid frequency')
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
                .oneOf(Object.values(RecurringDay), 'Invalid day')
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