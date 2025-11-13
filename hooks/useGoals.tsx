import { IncomeGoalProps, SavingsGoalProps, TransactionProps, TransactionType } from "@/constants/Types";
import { editGoal, fetchGoal } from "@/services/goals";
import { useState } from "react";
import { useCustomMutation } from "./useAppMutation";
import { useCustomQuery } from "./useAppQuery";

interface GoalsDataProps {
    savings: Partial<SavingsGoalProps>,
    income: Partial<IncomeGoalProps>,
}

export const defaultGoalsData: GoalsDataProps = {
    savings: {
        date: undefined,
        amount: undefined,
    },
    income: {
        perDay: undefined,
        perMonth: undefined,
        perYear: undefined,
    },
};

// Custom hook to fetch goals
export const useGoals = () => {
    return useCustomQuery<GoalsDataProps>({
        queryKey: ['goals'],
        queryFn: async () => {
            return {
                savings: await fetchGoal('savings'),
                income: await fetchGoal('income'),
            };
        },
        fallbackValue: defaultGoalsData,
    });
};

// Custom hook to update a goal
export const useUpdateGoal = () => {
    return useCustomMutation({
        mutationFn: (updatedGoalsData: { savings: SavingsGoalProps, income: IncomeGoalProps }) => editGoal(updatedGoalsData),
        invalidateKeys: () => [['goals']],    // Invalidate goals query on success
    });
}

// Custom hook to process goal data
export const useGoalData = (
    goals: GoalsDataProps = defaultGoalsData,
    expenseTransactions: TransactionProps[],
    incomeTransactions: TransactionProps[],
) => {
    const [savingsProgress, setSavingsProgress] = useState(0);
    const [incomeProgresses, setIncomeProgresses] = useState({ day: 0, month: 0, year: 0 });

    // Calculate savings goal progress
    // savings goal progress = (total income - total expenses) / target savings amount
    const calculateSavingsGoalProgress = () => {
        if (expenseTransactions.length === 0 || incomeTransactions.length === 0 || !goals) return 0;
        const expenseTotal = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        const incomeTotal = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);

        let progress = 0;
        if (goals.savings.date && goals.savings.amount) {         // If savings goal is set
            const savingsGoalAmount = Number(goals.savings.amount) || 0;
            if (savingsGoalAmount === 0) return;   // Prevent division by zero
            progress = (incomeTotal - expenseTotal) / savingsGoalAmount;
        }
        setSavingsProgress(progress);
    };

    // Calculate income goal progress for the selected period
    // 'day'    => average daily income / target daily income
    // 'month'  => average monthly income / target monthly income
    // 'year'   => average yearly income / target yearly income
    const calculateIncomeGoalProgress = (period: 'day' | 'month' | 'year') => {
        if (incomeTransactions.length === 0 || !goals) return 0;

        // Sort income transactions by date
        const sortedIncomeTransactions = incomeTransactions.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        // Get the first and last transaction dates
        const firstDate = sortedIncomeTransactions[0].date;
        const lastDate = sortedIncomeTransactions[sortedIncomeTransactions.length - 1].date;
        if (!firstDate || !lastDate) return 0;

        // Calculate total income
        const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        let avgIncomeByPeriod = 0;
        let progress = 0;

        switch (period) {
            case 'day':
                // Average daily income over the years
                avgIncomeByPeriod = (() => {
                    const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return totalIncome / daysDiff;
                })();

                if (goals.income.perDay) {
                    const incomeGoalPerDay = Number(goals.income.perDay) || 0;
                    if (incomeGoalPerDay === 0) return;   // Prevent division by zero
                    progress = avgIncomeByPeriod / incomeGoalPerDay;
                }
                break;
            case 'year':
                // Average yearly income over the years
                avgIncomeByPeriod = (() => {
                    const yearsDiff = lastDate.getFullYear() - firstDate.getFullYear() + 1;
                    return totalIncome / yearsDiff;
                })();

                if (goals.income.perYear) {
                    const incomeGoalPerYear = Number(goals.income.perYear) || 0;
                    if (incomeGoalPerYear === 0) return;   // Prevent division by zero
                    progress = avgIncomeByPeriod / incomeGoalPerYear;
                }
                break;
            default:
                // Average monthly income over the years
                avgIncomeByPeriod = (() => {
                    const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth()) + 1;
                    return totalIncome / monthsDiff;
                })();

                if (goals.income.perMonth) {
                    const incomeGoalPerMonth = Number(goals.income.perMonth) || 0;
                    if (incomeGoalPerMonth === 0) return;   // Prevent division by zero
                    progress = avgIncomeByPeriod / incomeGoalPerMonth;
                }
        }

        // Set progress based on the selected period
        setIncomeProgresses(prev => ({
            ...prev,
            [period]: progress,
        }));
    }

    // Savings per month (savings = income - expenses)
    const getSavingsPerMonth = (selectedYearTransactions: TransactionProps[]) => {
        const months_num = Array.from({ length: 12 }, (_, i) => i + 1);
        const { incomeTotalByMonth, expenseTotalByMonth } = selectedYearTransactions.reduce<{
            incomeTotalByMonth: Record<number, number>,
            expenseTotalByMonth: Record<number, number>,
        }>((acc, transaction) => {
            const month = new Date(transaction.date).getMonth() + 1;
            const amount = transaction.amount;

            if (transaction.type === TransactionType.INCOME) {
                acc.incomeTotalByMonth[month] = (acc.incomeTotalByMonth[month] || 0) + amount;
            } else if (transaction.type === TransactionType.EXPENSE) {
                acc.expenseTotalByMonth[month] = (acc.expenseTotalByMonth[month] || 0) + amount;
            }

            return acc;
        }, { incomeTotalByMonth: {}, expenseTotalByMonth: {} });

        const transactionByMonthArray = months_num.map((month) => ({
            month: month,
            savings: (incomeTotalByMonth[month] || 0) - (expenseTotalByMonth[month] || 0),
        }));

        return transactionByMonthArray;
    }

    // Income by selected period (day/month/year)
    const getIncomeByPeriod = (selectedPeriodIncomeTransactions: TransactionProps[], period: 'day' | 'month' | 'year') => {
        const now = new Date();
        let transactionByPeriodArray: { period: number, income: number }[] = [];
        let incomeByPeriod: Record<number, number> = {};

        const days_num: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
        const months_num = Array.from({ length: 12 }, (_, i) => i + 1);
        const years_num = Array.from({ length: 12 }, (_, i) => now.getFullYear() - 11 + i);
        if (period === 'day') {
            incomeByPeriod = selectedPeriodIncomeTransactions.reduce<Record<number, number>>((acc, t) => {
                const day = new Date(t.date).getDate();
                acc[day] = (acc[day] || 0) + t.amount;          // Add transaction amount to the respective day based on current month
                return acc;
            }, {});
        } else if (period === 'year') {
            incomeByPeriod = selectedPeriodIncomeTransactions.reduce<Record<number, number>>((acc, t) => {
                const year = new Date(t.date).getFullYear();
                acc[year] = (acc[year] || 0) + t.amount;        // Add transaction amount to the respective year
                return acc;
            }, {});
        } else {
            incomeByPeriod = selectedPeriodIncomeTransactions.reduce<Record<number, number>>((acc, t) => {
                const month = new Date(t.date).getMonth() + 1;
                acc[month] = (acc[month] || 0) + t.amount;      // Add transaction amount to the respective month
                return acc;
            }, {});
        }

        const period_num = period === 'day' ? days_num : period === 'year' ? years_num : months_num;
        transactionByPeriodArray = period_num.map(period => ({
            period: period,
            income: incomeByPeriod[period] || 0
        }));

        // Add an entry for 31st if not present (for months with less than 31 days)
        if (period === 'day' && transactionByPeriodArray.length !== 31) {
            transactionByPeriodArray.push({
                period: 31,
                income: 0,
            });
        }

        return transactionByPeriodArray;
    }

    return {
        calculateSavingsGoalProgress,
        calculateIncomeGoalProgress,
        savingsProgress,
        incomeProgresses,
        getSavingsPerMonth,
        getIncomeByPeriod,
    };
}