import {
    ExpenseCategory,
    IncomeCategory,
    TransactionCategory,
    TransactionCategoryType,
    TransactionType,
    TransactionTypeValue,
} from "@/types";

// Define color for transaction categories
export const CATEGORY_COLORS: { [key in TransactionCategoryType]: string } = {
    // Expense categories
    [ExpenseCategory.FOOD]: '#FF6F61',              // Coral Red
    [ExpenseCategory.ENTERTAINMENT]: '#6B5B95',     // Deep Purple
    [ExpenseCategory.UTILITIES]: '#45B8AC',         // Teal
    [ExpenseCategory.GROCERIES]: '#FFD662',         // Bright Yellow
    [ExpenseCategory.RENT]: '#955251',              // Mauve
    [ExpenseCategory.TRANSPORTATION]: '#034F84',    // Navy Blue
    [ExpenseCategory.DINING]: '#F7CAC9',            // Light Pink
    [ExpenseCategory.SUBSCRIPTIONS]: '#B565A7',     // Violet
    // Income categories
    [IncomeCategory.SALARY]: '#88B04B',             // Olive Green
    [IncomeCategory.FREELANCE]: '#F7786B',          // Salmon
    [IncomeCategory.INVESTMENT]: '#92A8D1',         // Soft Blue
    [IncomeCategory.GIFT]: '#DD4124',               // Red-Orange
    // Other category
    [TransactionCategory.OTHER]: '#939597',         // Gray
};

// Define color for transaction types
export const TRANSACTION_TYPE_COLORS: { [key in TransactionTypeValue]: string } = {
    [TransactionType.EXPENSE]: 'limegreen',             // Expense
    [TransactionType.INCOME]: '#e1e106ff',            // Income
};

// Define color for budget
export const BUDGET_COLOR = '#304cbdff';        // Dark blue

// Define color for goals
export const GOALS_COLOR = {
    'savings': '#5169c9ff',     // Blue
    'income': '#e1e106ff',      // Yellow
}