import { EXPENSE_CATEGORIES } from '@/constants/Types';
import * as Yup from 'yup';

export const budgetSchema = Yup.object().shape({
    year: Yup.string()
        .matches(/^\d{4}$/, 'Year must be a 4-digit number')
        .required('Year is required'),
    month: Yup.string()
        .matches(/^(0?[1-9]|1[0-2])$/, 'Month must be a number between 1 and 12')
        .required('Month is required'),
    category: Yup.string()
        .oneOf(EXPENSE_CATEGORIES, 'Invalid Category')
        .required('Category is required'),
    amount: Yup.number().typeError("Must be a number")
        .positive('Amount must be positive')
        .required('Amount is required'),
});