import { TransactionCategory } from "@/constants/Types";
import { budgetSchema } from "@/validation/budgetSchema";
import { useCustomFormik } from "./useAppFormik";
import { useUpdateBudget } from "./useBudgets";

interface BudgetFormikProps {
    year: string;
    month: string;
    category: string;
    amount: string;
}

// Formik setup
export const useBudgetFormik = (
    initialBudget?: BudgetFormikProps,
) => {
    const updateMutation = useUpdateBudget();

    return useCustomFormik({
        initialValues: initialBudget || {
            year: (new Date().getFullYear()).toString(),
            month: (new Date().getMonth() + 1).toString(),
            category: '',
            amount: '0',
        },
        validationSchema: budgetSchema,
        transformValues: (values) => ({
            year: Number(values.year),
            month: Number(values.month),
            category: values.category as TransactionCategory,
            amount: Number(values.amount),
        }),
        onSubmitCallback: (transformedBudgetData) => {
            updateMutation.mutate(transformedBudgetData);
        }
    });
};