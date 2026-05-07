import { getBudgets, updateBudget } from '@/database/budgetDatabase';
import { BudgetProps, FileType, TransactionCategoryType } from '@/types';
import { exportData, importData } from '@/utils/io';

// Fetch budgets
export const fetchBudgets = async () => {
  const response = await getBudgets();
  return response.data;
};

// Edit budget
export const editBudget = async (
  updatedBudgetAmount: number,
  {
    year,
    month,
    category,
  }: {
    year: number;
    month: number;
    category: TransactionCategoryType;
  },
) => {
  const response = await updateBudget(updatedBudgetAmount, {
    year,
    month,
    category,
  });
  return response.data;
};

// Export all budgets
export const exportAllBudgets = async (fileType: FileType) => {
  return exportData<BudgetProps>(
    fileType,
    async () => {
      const { data } = await getBudgets();
      return data;
    },
    'exported_budgets',
    'budget',
  );
};

// Import budgets from file
export const importBudgets = async (fileType: FileType) => {
  return importData<BudgetProps>(
    fileType,
    async (budget) => {
      const { amount, year, month, category } = budget as BudgetProps;
      const response = await updateBudget(amount, {
        year,
        month,
        category,
      });
      return response.data.success;
    },
    'budget',
  );
};
