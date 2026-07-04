import {
  RecurringFrequency,
  TransactionCategory,
  TransactionType,
} from '@/types';

export const mockDatabaseTransactions = [
  {
    id: 1,
    date: '2025-01-01',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.FOOD,
    amount: 10000,
    description: 'Grocery shopping',
    recurring: 0,
    recurring_frequency: null,
    accountId: 1,
  },
  {
    id: 2,
    date: null,
    type: TransactionType.EXPENSE,
    category: TransactionCategory.TRANSPORTATION,
    amount: 20000,
    description: 'Bus ticket',
    recurring: 1,
    recurring_frequency: JSON.stringify({
      frequency: RecurringFrequency.YEARLY,
      time: {
        month: 1,
        day: null,
        date: null,
      },
    }),
    accountId: 1,
  },
  {
    id: 3,
    date: null,
    type: TransactionType.INCOME,
    category: TransactionCategory.SALARY,
    amount: 300000,
    description: 'Monthly salary',
    recurring: 1,
    recurring_frequency: JSON.stringify({
      frequency: RecurringFrequency.MONTHLY,
      time: {
        month: null,
        day: null,
        date: 1,
      },
    }),
    accountId: 1,
  },
  {
    id: 4,
    date: '2025-01-02',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.TRANSPORTATION,
    amount: 20000,
    description: 'Bus ticket',
    recurring: 0,
    recurring_frequency: null,
    accountId: 1,
  },
  {
    id: 5,
    date: '2025-01-03',
    type: TransactionType.INCOME,
    category: TransactionCategory.FREELANCE,
    amount: 50000,
    description: 'Freelance project',
    recurring: 0,
    recurring_frequency: null,
    accountId: 1,
  },
];

export const mockTransactions = mockDatabaseTransactions.map((transaction) => ({
  ...transaction,
  date: transaction.date ? new Date(transaction.date) : null,
  amount: transaction.amount / 100,
  recurring: Boolean(transaction.recurring),
  recurring_frequency: transaction.recurring_frequency
    ? JSON.parse(transaction.recurring_frequency)
    : null,
}));

export const mockDatabaseBudgets = [
  {
    year: 2024,
    month: 8,
    category: TransactionCategory.FOOD,
    amount: 50000,
  },
  {
    year: 2025,
    month: 12,
    category: TransactionCategory.TRANSPORTATION,
    amount: 30000,
  },
  {
    year: 2023,
    month: 7,
    category: TransactionCategory.OTHER,
    amount: 400000,
  },
  {
    year: 2026,
    month: 8,
    category: TransactionCategory.RENT,
    amount: 60000,
  },
  {
    year: 2025,
    month: 1,
    category: TransactionCategory.ENTERTAINMENT,
    amount: 20000,
  },
  {
    year: 2024,
    month: 11,
    category: TransactionCategory.UTILITIES,
    amount: 15000,
  },
];

export const mockBudgets = mockDatabaseBudgets.map((budget) => ({
  ...budget,
  amount: budget.amount / 100,
}));

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
