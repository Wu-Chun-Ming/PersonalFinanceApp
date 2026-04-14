export const TransactionType = {
    EXPENSE: "expense",
    INCOME: "income",
} as const;

export type TransactionTypeValue = (typeof TransactionType)[keyof typeof TransactionType];

export const ExpenseCategory = {
    FOOD: "Food",
    ENTERTAINMENT: "Entertainment",
    UTILITIES: "Utilities",
    GROCERIES: "Groceries",
    RENT: "Rent",
    TRANSPORTATION: "Transportation",
    DINING: "Dining",
    SUBSCRIPTIONS: "Subscriptions",
    OTHER: "Other",
} as const;

export const IncomeCategory = {
    SALARY: "Salary",
    FREELANCE: "Freelance",
    INVESTMENT: "Investment",
    GIFT: "Gift",
    OTHER: "Other",
} as const;

export const TransactionCategory = {
    ...ExpenseCategory,
    ...IncomeCategory,
} as const;

export type ExpenseCategoryType = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];
export type IncomeCategoryType = (typeof IncomeCategory)[keyof typeof IncomeCategory];
export type TransactionCategoryType = (typeof TransactionCategory)[keyof typeof TransactionCategory];

export enum RecurringFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    YEARLY = "yearly",
}

export enum RecurringDay {
    MONDAY = "MO",
    TUESDAY = "TU",
    WEDNESDAY = "WE",
    THURSDAY = "TH",
    FRIDAY = "FR",
    SATURDAY = "SA",
    SUNDAY = "SU",
}

export type RecurringFrequencyProps = {
    frequency: RecurringFrequency;
    time: {
        month?: number | null;
        date?: number | null;
        day?: RecurringDay | null;
    };
};

type RecurringProps = {
    recurring: boolean;
    recurring_frequency: RecurringFrequencyProps | null;
};

type BaseTransactionProps = {
    id?: number;
    date: Date | null;
    amount: number;
    description: string;
    currency?: string;
} & RecurringProps;

export type ExpenseTransactionProps = BaseTransactionProps & {
    type: typeof TransactionType.EXPENSE;
    category: ExpenseCategoryType;
};

export type IncomeTransactionProps = BaseTransactionProps & {
    type: typeof TransactionType.INCOME;
    category: IncomeCategoryType;
};

export type TransactionProps = BaseTransactionProps & {
    type: TransactionTypeValue;
    category: TransactionCategoryType;
};

export type TransactionMultiDateProps = Omit<TransactionProps, 'date'> & {
    date: Date[] | null;
};
