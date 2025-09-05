import { useFont } from '@shopify/react-native-skia';
import { Href, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Progress from 'react-native-progress';
import { Bar, CartesianChart, Line } from 'victory-native';

// Gluestack UI
import { Divider } from '@/components/ui/divider';
import { Fab, FabIcon } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import inter from "@/assets/inter-medium.ttf";
import QueryState from '@/components/QueryState';
import { GOALS_COLOR } from '@/constants/Colors';
import { TransactionProps, TransactionType } from '@/constants/Types';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';

const GoalsScreen = () => {
    const font = useFont(inter, 12);
    const [savingsProgress, setSavingsProgress] = useState(0);
    const [incomeProgress, setIncomeProgress] = useState(0);
    const [incomeGraphMode, setIncomeGraphMode] = useState<'day' | 'month' | 'year'>('month');
    const {
        data: goals,
    } = useGoals();
    const {
        data: transactions,
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
        isRefetchError: isTransactionsRefetchError,
        isRefetching: isTransactionsRefetching,
        refetch: refetchTransactions
    } = useTransactions();
    const [currentSavingsRate, setCurrentSavingsRate] = useState<number>(0);       // Current savings rate = (income - expenses) / income * 100

    const calculateSavingsGoalProgress = (transactions: TransactionProps[]) => {
        const expenseTotal = transactions
            .filter(transaction => transaction.type === TransactionType.EXPENSE)
            .reduce((sum, transaction) => sum + transaction.amount, 0);
        const incomeTotal = transactions
            .filter(transaction => transaction.type === TransactionType.INCOME)
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        let progress = 0;
        if (goals?.savings && goals.savings.amount) {        // Savings goal
            const savingsGoalAmount = Number(goals.savings.amount) || 0;
            if (savingsGoalAmount == 0) return;   // Prevent division by zero
            progress = (incomeTotal - expenseTotal) / savingsGoalAmount;
        }
        setSavingsProgress(progress);
    };

    const calculateIncomeGoalProgress = (transactions: TransactionProps[]) => {
        const currentMonthlyIncome = (transactions
            .filter(transaction => transaction.type === TransactionType.INCOME)
            .reduce((sum, transaction) => sum + transaction.amount, 0)) / 12;

        let progress = 0;
        if (goals?.income && goals.income.perMonth) {      // Income goals
            const incomeGoalPerMonth = Number(goals.income.perMonth) || 0;
            if (incomeGoalPerMonth == 0) return;   // Prevent division by zero
            progress = currentMonthlyIncome / incomeGoalPerMonth;
        }
        setIncomeProgress(progress);
    }

    useEffect(() => {
        if (transactions) {
            // Calculate goals progress
            calculateSavingsGoalProgress(transactions as TransactionProps[]);
            calculateIncomeGoalProgress(transactions as TransactionProps[]);
            // Calculate current savings rate
            const currentSavingsTotal = getSavingsPerMonth(transactions)[new Date().getMonth()].savings;
            const currentIncomeTotal = getIncomePerMonth(transactions)[new Date().getMonth()].income;
            setCurrentSavingsRate(currentSavingsTotal / currentIncomeTotal * 100);
        }
    }, [goals]);

    // Savings per month (savings = income - expenses)
    const getSavingsPerMonth = (transactions: TransactionProps[]) => {
        const months_num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const expenseTransactions = transactions.filter(transaction => transaction.type === TransactionType.EXPENSE);
        const incomeTransactions = transactions.filter(transaction => transaction.type === TransactionType.INCOME);

        const transactionByMonthArray = months_num.map((month) => {
            const expenseTotalByMonth = expenseTransactions
                .filter((transaction) => {
                    if (!transaction.date) return false;

                    const transactionMonth = new Date(transaction.date.toString()).getMonth() + 1;
                    return transactionMonth === month;
                })
                .reduce((sum, transaction) => sum + transaction.amount, 0);

            const incomeTotalByMonth = incomeTransactions
                .filter((transaction) => {
                    if (!transaction.date) return false;

                    const transactionMonth = new Date(transaction.date.toString()).getMonth() + 1;
                    return transactionMonth === month;
                })
                .reduce((sum, transaction) => sum + transaction.amount, 0);

            return {
                month: month,
                savings: incomeTotalByMonth - expenseTotalByMonth,
            };
        });

        return transactionByMonthArray;
    }

    // Income per month
    const getIncomePerMonth = (transactions: TransactionProps[]) => {
        const months_num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const incomeTransactions = transactions.filter(transaction => transaction.type === TransactionType.INCOME);

        const transactionByMonthArray = months_num.map((month) => {
            const incomeTotalByMonth = incomeTransactions
                .filter((transaction) => {
                    if (!transaction.date) return false;

                    const transactionMonth = new Date(transaction.date.toString()).getMonth() + 1;
                    return transactionMonth === month;
                })
                .reduce((sum, transaction) => sum + transaction.amount, 0);

            return {
                month: month,
                income: incomeTotalByMonth,
            };
        });

        return transactionByMonthArray;
    }

    const GoalProgress = ({ goalType }: {
        goalType: "savings" | "income"
    }) => (
        <View style={styles.centeredFlex}>
            <View style={{
                backgroundColor: GOALS_COLOR[goalType],
                borderRadius: 10,
                paddingHorizontal: 10,
                marginVertical: 10,
            }}>
                <Heading className='my-5'
                    style={{
                        color: goalType === 'savings' ? 'white' : 'black',
                    }}
                >{goalType.charAt(0).toUpperCase() + goalType.slice(1)} Goal</Heading>
            </View>
            {/* Progress Indicator */}
            <Progress.Circle
                size={150}
                progress={goalType === 'savings' ? savingsProgress : incomeProgress}
                thickness={10}
                showsText={true}
                strokeCap="round"
                color={GOALS_COLOR[goalType]}
                animated={false}
                formatText={(progress) => (progress >= 1) ? `Achieved` : `${Math.round(progress * 100)}%`}
            />
        </View>
    );

    const queryState = (
        <QueryState
            isLoading={isTransactionsLoading}
            isError={isTransactionsError}
            isRefetching={isTransactionsRefetching}
            isRefetchError={isTransactionsRefetchError}
            queryKey='transactions'
            onRetry={refetchTransactions}
        />
    );

    if (isTransactionsLoading || isTransactionsRefetching || isTransactionsError || isTransactionsRefetchError) return queryState;

    return (
        <SafeAreaView style={{ flex: 1, }}>
            <ScrollView>
                <HStack className='my-2'>
                    {/* Savings Goal Progress */}
                    <GoalProgress goalType='savings' />

                    {/* Income Goal Progress */}
                    <GoalProgress goalType='income' />
                </HStack>

                <Divider
                    orientation="horizontal"
                    className="my-5 w-full bg-black"
                />

                {/* Savings Chart Label */}
                <HStack className="justify-between items-center mx-5">
                    <View style={{
                        backgroundColor: GOALS_COLOR['savings'],
                        borderRadius: 10,
                        padding: 10,
                    }}>
                        <Heading style={{
                                color: 'white',
                            }}
                        >Savings</Heading>
                    </View>

                    <HStack className="items-center">
                        <VStack className='items-center'>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                            }]}>Current</Text>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                            }]}>Savings Rate: </Text>
                        </VStack>
                        <View style={{
                            backgroundColor: GOALS_COLOR['savings'],
                            borderRadius: 10,
                            padding: 10,
                        }}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                                color: 'white',
                            }]}>{currentSavingsRate.toFixed(2)}%</Text>
                        </View>
                    </HStack>
                </HStack>

                {/* Savings Chart */}
                <View style={[styles.centered, {
                    height: 250,
                    paddingVertical: 10,
                }]}>
                    <View style={{
                        flex: 1,
                        width: '95%',
                    }}>
                        {transactions && <CartesianChart
                            data={getSavingsPerMonth(transactions as TransactionProps[])}
                            xKey="month"
                            xAxis={{
                                font,
                                tickCount: 12,
                                formatXLabel: (value) => {
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    return monthNames[(value - 1) % 12];
                                },
                            }}
                            yKeys={["savings"]}
                            axisOptions={{
                                font,
                                lineColor: "#d4d4d8",
                            }}
                            domainPadding={{ left: 20, right: 20, top: 10, }}
                        >
                            {({ points, chartBounds }) => (
                                <Bar
                                    points={points.savings}
                                    chartBounds={chartBounds}
                                    color={GOALS_COLOR['savings']}
                                />
                            )}
                        </CartesianChart>}
                    </View>
                </View>

                <Divider
                    orientation="horizontal"
                    className="my-5 w-full bg-black"
                />

                {/* Income Graph Label */}
                <HStack className="justify-between items-center mx-5">
                    <View style={{
                        backgroundColor: GOALS_COLOR['income'],
                        borderRadius: 10,
                        padding: 10,
                    }}>
                        <Heading>Income</Heading>
                    </View>

                    <Dropdown
                        data={[
                            { label: 'Per Day', value: 'day' },
                            { label: 'Per Month', value: 'month' },
                            { label: 'Per Year', value: 'year' },
                        ]}
                        labelField="label"
                        valueField="value"
                        value={incomeGraphMode}
                        onChange={(item) => setIncomeGraphMode(item.value)}
                        style={{
                            flex: 1,
                            padding: 5,
                            paddingLeft: 10,
                            borderWidth: 1,
                            borderRadius: 10,
                            maxWidth: 120,
                        }}
                        itemTextStyle={{
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    />
                </HStack>

                {/* Income Graph */}
                <View style={[styles.centered, {
                    height: 250,
                    paddingVertical: 10,
                }]}>
                    <View style={{
                        flex: 1,
                        width: '95%',
                    }}>
                        {transactions && <CartesianChart
                            data={getIncomePerMonth(transactions as TransactionProps[])}
                            xKey="month"
                            xAxis={{
                                font,
                                tickCount: 12,
                                formatXLabel: (value) => {
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    return monthNames[(value - 1) % 12];
                                },
                            }}
                            yKeys={["income"]}
                            axisOptions={{
                                font,
                                lineColor: "#d4d4d8",
                            }}
                            domainPadding={{ left: 20, right: 20, top: 10, }}
                        >
                            {({ points }) => (
                                <Line
                                    points={points.income}
                                    color={GOALS_COLOR['income']}
                                    strokeWidth={3}
                                    animate={{ type: "timing", duration: 300 }}
                                />
                            )}
                        </CartesianChart>}
                    </View>
                </View>
                {/* Reserve Space for Floating Action Button */}
                <View style={{ minHeight: 60 }}></View>
            </ScrollView>

            {/* Floating action button to edit goals */}
            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => router.navigate(`/goal/goal_settings` as Href)}
            >
                <FabIcon as={AddIcon} size='xl' />
            </Fab>
        </SafeAreaView>
    );
};

export default GoalsScreen;
