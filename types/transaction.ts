export const TransactionType = {
    EXPENSE: "expense",
    INCOME: "income",
} as const;

export type TransactionTypeValue = (typeof TransactionType)[keyof typeof TransactionType];

export const ExpenseCategory = {
    FOOD: "Food",
    ENTERTAINMENT: "Entertainment",
    UTILITIES: "Utilities",
    GROCERY: "Grocery",
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

export type ExpenseCategoryType = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];
export type IncomeCategoryType = (typeof IncomeCategory)[keyof typeof IncomeCategory];

export const EXPENSE_CATEGORIES: ExpenseCategoryType[] = [
    ExpenseCategory.FOOD,
    ExpenseCategory.ENTERTAINMENT,
    ExpenseCategory.UTILITIES,
    ExpenseCategory.GROCERY,
    ExpenseCategory.RENT,
    ExpenseCategory.TRANSPORTATION,
    ExpenseCategory.DINING,
    ExpenseCategory.SUBSCRIPTIONS,
    ExpenseCategory.OTHER,
];

export const INCOME_CATEGORIES: IncomeCategoryType[] = [
    IncomeCategory.SALARY,
    IncomeCategory.FREELANCE,
    IncomeCategory.INVESTMENT,
    IncomeCategory.GIFT,
    IncomeCategory.OTHER,
];

export const TransactionCategory = {
    ...ExpenseCategory,
    ...IncomeCategory,
} as const;

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

export type RecurringFrequencyProps =
    | {
        frequency: RecurringFrequency.DAILY;
    }
    | {
        frequency: RecurringFrequency.WEEKLY;
        day: RecurringDay;
    }
    | {
        frequency: RecurringFrequency.MONTHLY;
        date: number; // 1–31
    }
    | {
        frequency: RecurringFrequency.YEARLY;
        month: number; // 1–12
        date: number;  // 1–31
    };

type RecurringProps =
    | {
        recurring: false;
        recurring_frequency: null;
    }
    | {
        recurring: true;
        recurring_frequency: RecurringFrequencyProps;
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

export type TransactionProps =
    | ExpenseTransactionProps
    | IncomeTransactionProps;
