import { TransactionCategory, TransactionType } from "./Types";

// Define color for transaction categories
export const CATEGORY_COLORS: { [key in TransactionCategory]: string } = {
    // Expense categories
    [TransactionCategory.FOOD]: '#FF6F61',            // Coral Red
    [TransactionCategory.ENTERTAINMENT]: '#6B5B95',   // Deep Purple
    [TransactionCategory.UTILITIES]: '#45B8AC',       // Teal
    [TransactionCategory.GROCERY]: '#FFD662',         // Bright Yellow
    [TransactionCategory.RENT]: '#955251',            // Mauve
    [TransactionCategory.TRANSPORTATION]: '#034F84',  // Navy Blue
    [TransactionCategory.DINING]: '#F7CAC9',          // Light Pink
    [TransactionCategory.SUBSCRIPTIONS]: '#B565A7',   // Violet
    // Income categories
    [TransactionCategory.SALARY]: '#88B04B',          // Olive Green
    [TransactionCategory.FREELANCE]: '#F7786B',       // Salmon
    [TransactionCategory.INVESTMENT]: '#92A8D1',      // Soft Blue
    [TransactionCategory.GIFT]: '#DD4124',            // Red-Orange
    // Other category
    [TransactionCategory.OTHER]: '#939597',           // Gray
};

// Define color for transaction types
export const TRANSACTION_TYPE_COLORS: { [key in TransactionType]: string } = {
    [TransactionType.EXPENSE]: 'limegreen',             // Expense
    [TransactionType.INCOME]: '#e1e106ff',            // Income
};

// Define color for budget
export const BUDGET_COLOR = '#304cbdff'; // Dark blue

// Define color for goals
export const GOALS_COLOR = {
    'savings': '#5169c9ff',     // Blue
    'income': '#e1e106ff',      // Yellow
}