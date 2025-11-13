import { AntDesign } from '@expo/vector-icons';
import { useFont } from '@shopify/react-native-skia';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Progress from 'react-native-progress';
import { Bar, CartesianChart, Line } from 'victory-native';

// Gluestack UI
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import inter from "@/assets/inter-medium.ttf";
import { ActionFab } from '@/components/ActionFab';
import QueryState from '@/components/QueryState';
import { GOALS_COLOR } from '@/constants/Colors';
import {
    defaultGoalsData,
    useGoalData,
    useGoals,
} from '@/hooks/useGoals';
import {
    useIncomeGraphTransactions,
    useTransactionData,
    useTransactions,
} from '@/hooks/useTransactions';

const GoalsScreen = () => {
    const font = useFont(inter, 12);
    const [incomeProgressMode, setIncomeProgressMode] = useState<'day' | 'month' | 'year'>('month');
    const [incomeGraphMode, setIncomeGraphMode] = useState<'day' | 'month' | 'year'>('month');
    const {
        data: goals = defaultGoalsData,
    } = useGoals();
    const {
        data: transactions = [],
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
        isRefetchError: isTransactionsRefetchError,
        isRefetching: isTransactionsRefetching,
        refetch: refetchTransactions
    } = useTransactions();
    const [currentSavingsRate, setCurrentSavingsRate] = useState<number>(0);       // Current savings rate = (income - expenses) / income * 100
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const {
        expenseTransactions,
        incomeTransactions,
        selectedYearTransactions,
    } = useTransactionData(selectedYear);
    const {
        selectedPeriodIncomeTransactions
    } = useIncomeGraphTransactions(incomeTransactions, incomeGraphMode);
    const {
        calculateSavingsGoalProgress,
        calculateIncomeGoalProgress,
        savingsProgress,
        incomeProgresses,
        getSavingsPerMonth,
        getIncomeByPeriod,
    } = useGoalData(goals, expenseTransactions, incomeTransactions);

    useEffect(() => {
        if (transactions) {
            // Calculate goals progress
            calculateSavingsGoalProgress();
            calculateIncomeGoalProgress(incomeProgressMode);
            // Calculate current savings rate
            const currentSavingsTotal = getSavingsPerMonth(transactions)[new Date().getMonth()].savings;
            const currentIncomeTotal = getIncomeByPeriod(incomeTransactions, 'month')[new Date().getMonth()].income;
            const currentSavingsRate = currentIncomeTotal === 0 ? 0 : (currentSavingsTotal / currentIncomeTotal * 100);
            setCurrentSavingsRate(currentSavingsRate);
        }
    }, [goals]);

    const GoalProgress = ({ goalType }: {
        goalType: "savings" | "income"
    }) => (
        <View style={{
            flex: 1,
            alignItems: "center",
        }}>
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
            <TouchableNativeFeedback
                onPress={() => {
                    setIncomeProgressMode(goalType === 'income'
                        ? (incomeProgressMode === 'day' ? 'month'
                            : incomeProgressMode === 'month'
                                ? 'year'
                                : 'day')
                        : incomeProgressMode);
                    if (incomeTransactions && (goals?.income.perDay || goals?.income.perMonth || goals?.income.perYear)) {
                        calculateIncomeGoalProgress(incomeProgressMode);
                    }
                }}
                disabled={goalType !== 'income'}
            >
                <Progress.Circle
                    size={150}
                    progress={goalType === 'savings' ? savingsProgress : incomeProgresses[incomeProgressMode]}
                    thickness={10}
                    showsText={true}
                    strokeCap="round"
                    color={GOALS_COLOR[goalType]}
                    animated={false}
                    formatText={(progress) => (progress >= 1) ? `Achieved` : `${Math.round(progress * 100)}%`
                    }
                    textStyle={{
                        textAlign: 'center',
                    }}
                />
            </TouchableNativeFeedback>
            <Text style={[styles.text, {
                marginTop: 10,
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'black',
            }]}>
                {goalType === 'savings'
                    ? ((goals?.savings.date && goals?.savings.amount)
                        ? `Target: RM${goals.savings.amount}\n`
                        + `by ${new Date(goals.savings.date).toLocaleDateString()}`
                        : 'No savings goal set')
                    : ((goals?.income.perDay || goals?.income.perMonth || goals?.income.perYear)
                        ? `Target: RM${incomeProgressMode === 'day' ? goals.income.perDay
                            : incomeProgressMode === 'month' ? goals.income.perMonth
                                : goals.income.perYear}\n`
                        + `per ${incomeProgressMode}`
                        : 'No income goal set')}
            </Text>
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
                    height: 280,
                    paddingVertical: 10,
                }]}>
                    <HStack className="justify-between items-center mb-2">
                        <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
                            <AntDesign name="leftcircle" size={24} color={GOALS_COLOR['savings']} style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                            Year {selectedYear}
                        </Text>

                        <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
                            <AntDesign name="rightcircle" size={24} color={GOALS_COLOR['savings']} style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>
                    </HStack>

                    <View style={{
                        flex: 1,
                        width: '95%',
                    }}>
                        {transactions && <CartesianChart
                            data={getSavingsPerMonth(selectedYearTransactions)}
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
                        {selectedPeriodIncomeTransactions && <CartesianChart
                            data={getIncomeByPeriod(selectedPeriodIncomeTransactions, incomeGraphMode)}
                            xKey="period"
                            xAxis={{
                                font,
                                tickCount: incomeGraphMode === 'day' ? 31 : 12,
                                formatXLabel: (value) => {
                                    switch (incomeGraphMode) {
                                        case "day":
                                            return value % 5 === 0 || value === 1 ? String(value) : "";
                                        case "year":
                                            return value % 2 === 0 ? String(value) : "";
                                        default:
                                            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                            return months[value - 1] || "";
                                    }
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
            <ActionFab
                href={`/goal/goal_settings`}
                icon={AddIcon}
            />
        </SafeAreaView >
    );
};

export default GoalsScreen;
