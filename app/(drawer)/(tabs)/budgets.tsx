import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import BarChart from '@/components/BarChart';
import BudgetModal from '@/components/BudgetModal';
import MonthSelector from '@/components/MonthSelector';
import QueryState from '@/components/QueryState';
import YearSelector from '@/components/YearSelector';
import { BUDGET_COLOR, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, TransactionType } from '@/constants/Types';
import { useBudgetData, useBudgets } from '@/hooks/useBudgets';
import { useBudgetFormik } from '@/hooks/useBudgetsFormik';
import {
    useTransactionData,
    useTransactions,
} from '@/hooks/useTransactions';

const BudgetScreen = () => {
    const {
        data: budgets = [],
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useBudgets();
    const {
        data: transactions = [],
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
        isRefetchError: isTransactionsRefetchError,
        isRefetching: isTransactionsRefetching,
        refetch: refetchTransactions
    } = useTransactions();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const {
        selectedYearExpenseTransactions,
        selectedMonthExpenseTransactions,
    } = useTransactionData(transactions, selectedYear, selectedMonth);
    const {
        selectedYearBudgets,
        expenseTotalsByCategory,
        budgetByCategory,
        expensesAndBudgetsByMonth,
    } = useBudgetData(budgets, selectedYearExpenseTransactions, selectedMonthExpenseTransactions, selectedYear, selectedMonth);

    // Formik setup
    const {
        budgetFormik: formik,
        budgetModalVisible,
        setBudgetModalVisible,
    } = useBudgetFormik();

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='budgets'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Bar Chart */}
            <View style={[styles.centered, {
                height: "40%",
            }]}>
                <View style={{
                    width: '95%',
                    height: "100%",
                }}>
                    <YearSelector
                        onYearChange={(year) => setSelectedYear(year)}
                    />
                    {(
                        (selectedYearExpenseTransactions && selectedYearExpenseTransactions.length > 0)
                        || (selectedYearBudgets && selectedYearBudgets.length > 0)
                    ) ? <VStack
                        style={{
                            flex: 1,
                        }}
                    >
                        <BarChart
                            data={expensesAndBudgetsByMonth}
                            xKey="month"
                            yKeys={[
                                ["expensePerMonth", TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ["budgetPerMonth", BUDGET_COLOR],
                            ]}
                            legends={[
                                ["Expense", TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ["Budget", BUDGET_COLOR],
                            ]}
                        />
                    </VStack>
                        : <View style={[styles.centeredFlex]}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>No budget data available.</Text>
                        </View>}
                </View>
            </View>

            <View style={styles.centered}>
                <View style={{
                    backgroundColor: BUDGET_COLOR,
                    borderRadius: 20,
                    margin: 10,
                    width: '60%',
                }}>
                    <MonthSelector
                        onMonthChange={(month) => setSelectedMonth(month)}
                    />
                </View>
            </View>

            <ScrollView>
                <View style={{
                    margin: 10,
                }}>
                    {EXPENSE_CATEGORIES.map((category) => {
                        const expenseTotal = expenseTotalsByCategory[category] || 0;
                        const budget = budgetByCategory[category];
                        const progress = (expenseTotal) / (budget?.amount || 1) * 100; // Calculate progress as a percentage

                        return (
                            <TouchableOpacity
                                key={category}
                                onPress={() => {
                                    setBudgetModalVisible(true);
                                    if (budget) {
                                        formik.setValues({
                                            year: budget.year.toString(),
                                            month: budget.month.toString(),
                                            category: budget.category,
                                            amount: (budget.amount || 0).toString(),
                                        });
                                    } else {
                                        formik.setFieldValue('category', category);
                                    }
                                }}
                            >
                                <View key={category} style={{ marginVertical: 5, }}>
                                    <HStack key={category} className='flex-1 justify-between max-w-80 w-full'>
                                        <Heading>{category}</Heading>
                                        <Heading style={{
                                            color: progress > 100 ? "red" : "black",
                                        }}>({progress.toFixed(1)}%)</Heading>
                                    </HStack>
                                    <HStack className='justify-between items-start gap-2'>
                                        <Progress.Bar
                                            progress={progress / 100}
                                            width={280}
                                            height={20}
                                            borderRadius={10}
                                            color={progress > 100 ? "red" : TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]}
                                            borderColor={BUDGET_COLOR}
                                        />
                                        <View style={styles.centeredFlex}>
                                            <Text style={[styles.text, {
                                                color: progress > 100 ? "red" : "black",
                                                marginLeft: 5,
                                            }]}>
                                                {Math.ceil(expenseTotal)}/{budget?.amount || 0}
                                            </Text>
                                        </View>
                                    </HStack>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Budget Modal */}
            {budgetModalVisible && (
                <BudgetModal
                    isOpen={budgetModalVisible}
                    onClose={() => {
                        formik.resetForm();
                        setBudgetModalVisible(false);
                    }}
                    formik={formik}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    expenseCategories={EXPENSE_CATEGORIES}
                />
            )}
        </SafeAreaView>
    );
};

export default BudgetScreen;
