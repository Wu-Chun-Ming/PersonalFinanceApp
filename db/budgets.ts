import { TransactionCategory } from "@/constants/Types";
import { getBudgets, updateBudget } from "./database";

// Fetch budgets
export const fetchBudgets = async () => {
  const response = await getBudgets();
  return response.data;
};

// Edit budget
export const editBudget = async (updatedBudgetAmount: number, { year, month, category }: { year: number; month: number; category: TransactionCategory }) => {
  const response = await updateBudget(updatedBudgetAmount, { year, month, category });
  return response.data;
};
