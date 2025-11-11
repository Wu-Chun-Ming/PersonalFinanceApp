import { RecurringFrequency, TransactionCategory, TransactionType } from "@/constants/Types";

export const mockDatabaseTransactions = [
    {
        id: 1,
        date: '2025-01-01',
        type: TransactionType.EXPENSE,
        category: TransactionCategory.FOOD,
        amount: 100,
        description: 'Grocery shopping',
        recurring: 0,
        recurring_frequency: null,
    },
    {
        id: 2,
        date: null,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.TRANSPORTATION,
        amount: 200,
        description: 'Bus ticket',
        recurring: 1,
        recurring_frequency: JSON.stringify({
            frequency: RecurringFrequency.YEARLY,
            time: {
                month: 1,
                day: null,
                date: null,
            }
        }),
    },
    {
        id: 3,
        date: null,
        type: TransactionType.INCOME,
        category: TransactionCategory.SALARY,
        amount: 3000,
        description: 'Monthly salary',
        recurring: 1,
        recurring_frequency: JSON.stringify({
            frequency: RecurringFrequency.MONTHLY,
            time: {
                month: null,
                day: null,
                date: 1,
            }
        }),
    },
    {
        id: 4,
        date: '2025-01-02',
        type: TransactionType.EXPENSE,
        category: TransactionCategory.TRANSPORTATION,
        amount: 200,
        description: 'Bus ticket',
        recurring: 0,
        recurring_frequency: null,
    },
    {
        id: 5,
        date: '2025-01-03',
        type: TransactionType.INCOME,
        category: TransactionCategory.FREELANCE,
        amount: 500,
        description: 'Freelance project',
        recurring: 0,
        recurring_frequency: null,
    },
];

export const mockTransactions = [
    {
        id: 1,
        date: new Date('2025-01-01'),
        type: TransactionType.EXPENSE,
        category: TransactionCategory.FOOD,
        amount: 100,
        description: 'Grocery shopping',
        recurring: false,
        recurring_frequency: null,
    },
    {
        id: 2,
        date: null,
        type: TransactionType.EXPENSE,
        category: TransactionCategory.TRANSPORTATION,
        amount: 200,
        description: 'Bus ticket',
        recurring: true,
        recurring_frequency: {
            frequency: RecurringFrequency.YEARLY,
            time: {
                month: 1,
                day: null,
                date: null,
            }
        },
    },
    {
        id: 3,
        date: null,
        type: TransactionType.INCOME,
        category: TransactionCategory.SALARY,
        amount: 3000,
        description: 'Monthly salary',
        recurring: true,
        recurring_frequency: {
            frequency: RecurringFrequency.MONTHLY,
            time: {
                month: null,
                day: null,
                date: 1,
            }
        },
    },
    {
        id: 4,
        date: new Date('2025-01-02'),
        type: TransactionType.EXPENSE,
        category: TransactionCategory.TRANSPORTATION,
        amount: 200,
        description: 'Bus ticket',
        recurring: false,
        recurring_frequency: null,
    },
    {
        id: 5,
        date: new Date('2025-01-03'),
        type: TransactionType.INCOME,
        category: TransactionCategory.FREELANCE,
        amount: 500,
        description: 'Freelance project',
        recurring: false,
        recurring_frequency: null,
    },
];

export const mockBudgets = [
    {
        year: 2024,
        month: 8,
        category: TransactionCategory.FOOD,
        amount: 500,
    },
    {
        year: 2025,
        month: 12,
        category: TransactionCategory.TRANSPORTATION,
        amount: 300,
    },
    {
        year: 2023,
        month: 7,
        category: TransactionCategory.OTHER,
        amount: 4000,
    },
    {
        year: 2026,
        month: 8,
        category: TransactionCategory.RENT,
        amount: 600,
    },
    {
        year: 2025,
        month: 1,
        category: TransactionCategory.ENTERTAINMENT,
        amount: 200,
    },
    {
        year: 2024,
        month: 11,
        category: TransactionCategory.UTILITIES,
        amount: 150,
    },
];

export const mockDefaultGoals = {
    savings: {
        date: undefined,
        amount: undefined,
    },
    income: {
        perDay: undefined,
        perMonth: undefined,
        perYear: undefined,
    },
};

export const mockGoals = {
    savings: {
        date: new Date('2025-09-27'),
        amount: 5000,
    },
    income: {
        perDay: 400,
        perMonth: 10000,
        perYear: 110000,
    },
};