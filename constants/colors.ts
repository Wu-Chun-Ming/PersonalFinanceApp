import {
  AccountType,
  ExpenseCategory,
  IncomeCategory,
  InvestmentType,
  TransactionCategory,
  TransactionCategoryType,
  TransactionType,
  TransactionTypeValue,
} from '@/types';

// Define color for transaction categories
export const TRANSACTION_CATEGORY_COLORS: {
  [key in TransactionCategoryType]: string;
} = {
  // Expense categories
  [ExpenseCategory.FOOD]: '#FF6F61', // Coral Red
  [ExpenseCategory.ENTERTAINMENT]: '#6B5B95', // Deep Purple
  [ExpenseCategory.UTILITIES]: '#45B8AC', // Teal
  [ExpenseCategory.GROCERIES]: '#FFD662', // Bright Yellow
  [ExpenseCategory.RENT]: '#955251', // Mauve
  [ExpenseCategory.TRANSPORTATION]: '#034F84', // Navy Blue
  [ExpenseCategory.DINING]: '#F7CAC9', // Light Pink
  [ExpenseCategory.SUBSCRIPTIONS]: '#B565A7', // Violet
  // Income categories
  [IncomeCategory.SALARY]: '#88B04B', // Olive Green
  [IncomeCategory.FREELANCE]: '#F7786B', // Salmon
  [IncomeCategory.INVESTMENT]: '#92A8D1', // Soft Blue
  [IncomeCategory.GIFT]: '#DD4124', // Red-Orange
  // Other category
  [TransactionCategory.OTHER]: '#939597', // Gray
};

// Define color for transaction types
export const TRANSACTION_TYPE_COLORS: {
  [key in TransactionTypeValue]: string;
} = {
  [TransactionType.EXPENSE]: 'limegreen', // Expense
  [TransactionType.INCOME]: '#e1e106ff', // Income
};

// Define color for budget
export const BUDGET_COLOR = '#304cbdff'; // Dark blue

// Define color for goals
export const GOALS_COLOR = {
  savings: '#5169c9ff', // Blue
  income: '#e1e106ff', // Yellow
};

// Define color for account types
export const ACCOUNT_TYPE_COLORS = {
  [AccountType.BANK]: '#1f77b4', // Blue
  [AccountType.E_WALLET]: '#ff7f0e', // Orange
  [AccountType.CASH]: '#2ca02c', // Green
  [AccountType.INVESTMENT]: '#d62728', // Red
};

// Define color for investment types
export const INVESTMENT_TYPE_COLORS = {
  [InvestmentType.STOCK]: '#1f77b4', // Blue
  [InvestmentType.BOND]: '#ff7f0e', // Orange
  [InvestmentType.MUTUAL_FUND]: '#2ca02c', // Green
  [InvestmentType.ETF]: '#d62728', // Red
  [InvestmentType.REIT]: '#9467bd', // Purple
  [InvestmentType.COMMODITY]: '#8c564b', // Brown
  [InvestmentType.CRYPTO]: '#e377c2', // Pink
  [InvestmentType.CASH]: '#7f7f7f', // Gray
  [InvestmentType.EPF]: '#bcbd22', // Olive
  [InvestmentType.ASNB]: '#17becf', // Cyan
  [InvestmentType.PRS]: '#aec7e8', // Light Blue
  [InvestmentType.FD]: '#ffbb78', // Light Orange
};
