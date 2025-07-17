import dayjs from "dayjs";

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
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

export type TransactionProps = {
  id?: number,
  date: Date | dayjs.Dayjs,
  type: TransactionType,
  category: TransactionCategory,
  amount: number,
  description: string,
  recurring: boolean,
  currency?: string,
};