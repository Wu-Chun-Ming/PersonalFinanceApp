import {
    ExpenseCategory,
    ExpenseCategoryType,
    IncomeCategory,
    IncomeCategoryType,
    RecurringDay,
    RecurringFrequency,
    TransactionType,
    TransactionTypeValue
} from "@/types";

export const TRANSACTION_TYPES: TransactionTypeValue[] = Object.values(TransactionType);

export const EXPENSE_CATEGORIES: ExpenseCategoryType[] = Object.values(ExpenseCategory);
export const INCOME_CATEGORIES: IncomeCategoryType[] = Object.values(IncomeCategory);
export const TRANSACTION_CATEGORIES: (ExpenseCategoryType | IncomeCategoryType)[] = [
    ...EXPENSE_CATEGORIES,
    ...INCOME_CATEGORIES,
];

export const RECURRING_FREQUENCIES = Object.values(RecurringFrequency);

export const RECURRING_DAYS = Object.values(RecurringDay);