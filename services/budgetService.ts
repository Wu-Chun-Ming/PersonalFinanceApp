import {
    getBudgets,
    updateBudget,
} from "@/database/budgetDatabase";
import { TransactionCategoryType } from "@/types";

// Fetch budgets
export const fetchBudgets = async () => {
    const response = await getBudgets();
    return response.data;
};

// Edit budget
export const editBudget = async (updatedBudgetAmount: number, {
    year,
    month,
    category,
}: {
    year: number;
    month: number;
    category: TransactionCategoryType;
}) => {
    const response = await updateBudget(updatedBudgetAmount, {
        year,
        month,
        category,
    });
    return response.data;
};
