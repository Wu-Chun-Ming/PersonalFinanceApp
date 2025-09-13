import { AntDesign } from '@expo/vector-icons';
import { useFont } from '@shopify/react-native-skia';
import { Href, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
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
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useGoals } from '@/hooks/useGoals';
import { useTransactions } from '@/hooks/useTransactions';

const GoalsScreen = () => {
    const font = useFont(inter, 12);
    const [savingsProgress, setSavingsProgress] = useState(0);
    const [incomeProgresses, setIncomeProgresses] = useState({ day: 0, month: 0, year: 0 });
    const [incomeProgressMode, setIncomeProgressMode] = useState<'day' | 'month' | 'year'>('month');
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
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const selectedYearTransactions = useFilteredTransactions(transactions ?? [], {
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear, 11, 31),
    });
    const incomeTransactions = useFilteredTransactions(transactions ?? [], {
        type: TransactionType.INCOME,
        recurring: false,
    });
    // Transactions in the selected period for income graph
    // 'day' => current month
    // 'month' => current year
    // 'year' => last 12 years
    const selectedPeriodIncomeTransactions = useFilteredTransactions(transactions ?? [], {
        type: TransactionType.INCOME,
        recurring: false,
        startDate: incomeGraphMode === 'day' ? new Date(now.getFullYear(), now.getMonth(), 1)       // First day of current month
            : incomeGraphMode === 'month' ? new Date(now.getFullYear(), 0, 1)                       // First day of current year
                : new Date(now.getFullYear() - 11, 0, 1),                                           // First day of year (11 years ago)
        endDate: incomeGraphMode === 'day' ? new Date(now.getFullYear(), now.getMonth() + 1, 0)     // Last day of current month
            : incomeGraphMode === 'month' ? new Date(now.getFullYear() + 1, 0, 0)                   // Last day of current year
                : new Date(now.getFullYear() + 1, 0, 0),                                            // Last day of current year
    });

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

        if (period === 'day') {
            // Average daily income over the years
            avgIncomeByPeriod = (() => {
                const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return totalIncome / daysDiff;
            })();

            if (goals.income.perDay) {
                const incomeGoalPerDay = Number(goals.income.perDay) || 0;
                if (incomeGoalPerDay == 0) return;   // Prevent division by zero
                progress = avgIncomeByPeriod / incomeGoalPerDay;
            }
        } else if (period === 'year') {
            // Average yearly income over the years
            avgIncomeByPeriod = (() => {
                const yearsDiff = lastDate.getFullYear() - firstDate.getFullYear() + 1;
                return totalIncome / yearsDiff;
            })();

            if (goals.income.perYear) {
                const incomeGoalPerYear = Number(goals.income.perYear) || 0;
                if (incomeGoalPerYear == 0) return;   // Prevent division by zero
                progress = avgIncomeByPeriod / incomeGoalPerYear;
            }
        } else {
            // Average monthly income over the years
            avgIncomeByPeriod = (() => {
                const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + (lastDate.getMonth() - firstDate.getMonth()) + 1;
                return totalIncome / monthsDiff;
            })();

            if (goals.income.perMonth) {
                const incomeGoalPerMonth = Number(goals.income.perMonth) || 0;
                if (incomeGoalPerMonth == 0) return;   // Prevent division by zero
                progress = avgIncomeByPeriod / incomeGoalPerMonth;
            }
        }

        // Set progress based on the selected period
        setIncomeProgresses(prev => ({
            ...prev,
            [period]: progress,
        }));
    }

    useEffect(() => {
        if (transactions) {
            // Calculate goals progress
            calculateSavingsGoalProgress(transactions as TransactionProps[]);
            if (incomeTransactions && (goals?.income.perDay || goals?.income.perMonth || goals?.income.perYear)) {
                calculateIncomeGoalProgress(incomeProgressMode);
            }
            // Calculate current savings rate
            const currentSavingsTotal = getSavingsPerMonth(transactions)[new Date().getMonth()].savings;
            const currentIncomeTotal = getIncomeByPeriod(transactions.filter(t => t.type === TransactionType.INCOME), 'month')[new Date().getMonth()].income;
            const currentSavingsRate = currentIncomeTotal === 0 ? 0 : (currentSavingsTotal / currentIncomeTotal * 100);
            setCurrentSavingsRate(currentSavingsRate);
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

    // Income by selected period (day/month/year)
    const getIncomeByPeriod = (selectedPeriodIncomeTransactions: TransactionProps[], period: 'day' | 'month' | 'year') => {
        let transactionByPeriodArray: { period: number, income: number }[] = [];
        let incomeByPeriod: Record<number, number> = {};

        const days_num: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
        const months_num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const years_num = Array.from({ length: 12 }, (_, i) => now.getFullYear() - 11 + i);
        if (period === 'day') {
            incomeByPeriod = selectedPeriodIncomeTransactions.reduce<Record<number, number>>((acc, t) => {
                const day = new Date(t.date).getDate();
                acc[day] = (acc[day] || 0) + t.amount;      // Add transaction amount to the respective day based on current month
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
        console.log(`Income by ${period}: `, transactionByPeriodArray);

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
                        {transactions && <CartesianChart
                            data={getIncomeByPeriod(selectedPeriodIncomeTransactions, incomeGraphMode)}
                            xKey="period"
                            xAxis={{
                                font,
                                tickCount: incomeGraphMode === 'day' ? 31 : 12,
                                formatXLabel: (value) => {
                                    if (incomeGraphMode === "day") {
                                        return value % 5 === 0 || value === 1 ? String(value) : "";
                                    } else if (incomeGraphMode === "year") {
                                        return value % 2 === 0 ? String(value) : "";
                                    } else {
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
