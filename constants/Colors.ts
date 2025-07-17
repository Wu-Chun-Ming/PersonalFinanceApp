import { TransactionCategory, TransactionType } from "./Types";

// Define color for categories
export const CATEGORY_COLORS: { [key in TransactionCategory]: string } = {
    [TransactionCategory.FOOD]: '#ff9800',            // Orange
    [TransactionCategory.ENTERTAINMENT]: '#9c27b0',   // Purple
    [TransactionCategory.UTILITIES]: '#2196f3',       // Blue
    [TransactionCategory.GROCERY]: '#ff5733',         // Orange-Red
    [TransactionCategory.RENT]: '#33FF57',            // Light Green
    [TransactionCategory.TRANSPORTATION]: '#3357FF',  // Blue
    [TransactionCategory.DINING]: '#F1C40F',          // Yellow
    [TransactionCategory.SUBSCRIPTIONS]: '#8E44AD',   // Purple
    [TransactionCategory.SALARY]: '#4caf50',          // Green
    [TransactionCategory.FREELANCE]: '#a2b9b4ff',     // Grayish Blue
    [TransactionCategory.INVESTMENT]: '#E74C3C',      // Red
    [TransactionCategory.GIFT]: '#F39C12',            // Orange
    [TransactionCategory.OTHER]: '#607d8b',           // Blue Grey
};

// Define color for transaction types
export const TRANSACTION_TYPE_COLORS: { [key in TransactionType]: string } = {
    [TransactionType.EXPENSE]: 'limegreen',             // Expense
    [TransactionType.INCOME]: '#e1e106ff',            // Income
};