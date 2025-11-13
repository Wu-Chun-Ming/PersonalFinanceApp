import { goalSchema } from '@/validation/goalSchema';
import { useCustomFormik } from './useAppFormik';
import { useUpdateGoal } from './useGoals';

interface GoalsFormikProps {
    savings: {
        date: string;
        amount: string;
    };
    income: {
        perDay: string;
        perMonth: string;
        perYear: string;
    };
}

export const useGoalsFormik = (
    initialGoals?: GoalsFormikProps,
) => {
    const updateMutation = useUpdateGoal();

    return useCustomFormik({
        initialValues: initialGoals || {
            savings: {
                date: '',
                amount: '0',
            },
            income: {
                perDay: '0',
                perMonth: '0',
                perYear: '0',
            },
        },
        validationSchema: goalSchema,
        transformValues: (values) => ({
            savings: {
                date: new Date(values.savings.date),
                amount: Number(values.savings.amount),
            },
            income: {
                perDay: Number(values.income.perDay),
                perMonth: Number(values.income.perMonth),
                perYear: Number(values.income.perYear),
            },
        }),
        onSubmitCallback: (transformedGoalsData) => {
            updateMutation.mutate(transformedGoalsData);
        },
    });
};
