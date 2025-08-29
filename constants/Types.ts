export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
}

export enum TransactionCategory {
  FOOD = "Food",
  ENTERTAINMENT = "Entertainment",
  UTILITIES = "Utilities",
  GROCERY = "Groceries",
  RENT = "Rent",
  TRANSPORTATION = "Transportation",
  DINING = "Dining",
  SUBSCRIPTIONS = "Subscriptions",
  SALARY = "Salary",
  FREELANCE = "Freelance",
  INVESTMENT = "Investment",
  GIFT = "Gift",
  OTHER = "Other",
}

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  TransactionCategory.FOOD,
  TransactionCategory.ENTERTAINMENT,
  TransactionCategory.UTILITIES,
  TransactionCategory.GROCERY,
  TransactionCategory.RENT,
  TransactionCategory.TRANSPORTATION,
  TransactionCategory.DINING,
  TransactionCategory.SUBSCRIPTIONS,
  TransactionCategory.OTHER,
];

export const INCOME_CATEGORIES: TransactionCategory[] = [
  TransactionCategory.SALARY,
  TransactionCategory.FREELANCE,
  TransactionCategory.INVESTMENT,
  TransactionCategory.GIFT,
  TransactionCategory.OTHER,
];

export enum Frequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export type RecurringFrequency = {
  frequency: Frequency;
  time: {
    month?: string | null;
    day?: string | null;
    date?: string | null;
  };
}

export type TransactionProps = {
  id?: number,
  date: Date | null,
  type: TransactionType,
  category: TransactionCategory,
  amount: number,
  description: string,
  recurring: boolean,
  recurring_frequency: RecurringFrequency | null,
  currency?: string,
};

export type BudgetProps = {
  year: number;
  month: number;
  category: TransactionCategory,
  amount: number,
};

export type SavingsGoalProps = {
  date: Date,
  amount: number,
};

export type IncomeGoalProps = {
  perDay: number,
  perMonth: number,
  perYear: number,
};