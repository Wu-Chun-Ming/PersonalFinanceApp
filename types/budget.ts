import { TransactionCategoryType } from "./transaction";

export interface BudgetProps {
    year: number;
    month: number;
    category: TransactionCategoryType,
    amount: number,
};