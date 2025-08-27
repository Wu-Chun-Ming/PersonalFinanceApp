import { useFont } from '@shopify/react-native-skia';
import { Href, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { BarGroup, CartesianChart } from 'victory-native';

// Gluestack UI
import { Box } from '@/components/ui/box';
import { Fab, FabIcon } from '@/components/ui/fab';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import inter from "@/assets/inter-medium.ttf";
import QueryState from '@/components/QueryState';
import { TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';
import { useTransactions } from '@/hooks/useTransactions';

const TransactionScreen = () => {
    const font = useFont(inter, 12);
    const {
        data: transactions,
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useTransactions();
    const [expenseTotal, setExpenseTotal] = useState<number>(0);
    const [incomeTotal, setIncomeTotal] = useState<number>(0);

    // Calculate the total amount based on transaction type and category
    const getTransactionBreakdownByType = (categories: TransactionCategory[], transactionType: TransactionType) => (
        categories.map((category) => {
            const total = (transactions as TransactionProps[]).filter(transaction => transaction.type === transactionType)
                .filter((transaction) => transaction.category === category)
                .reduce((sum, transaction) => sum + transaction.amount, 0);

            return {
                category,
                total,
            };
        })
    );

    const TransactionsListing = ({ type }: { type: "expense" | "income" }) => {
        const transactionType = type === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME;
        const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

        return (
            <VStack>
                {(getTransactionBreakdownByType(categories, transactionType))
                    .sort((a, b) => b.total - a.total)  // Sort in descending order by 'amount'
                    .slice(0, 5)  // Limit to the top 5 category
                    .map((item, index) => {
                        if (item.total != 0) {
                            return (
                                <HStack
                                    key={index}
                                    className='justify-between'
                                    style={{
                                        marginHorizontal: 20,
                                        marginVertical: 10,
                                    }}
                                >
                                    <View style={{
                                        width: '50%',
                                    }}>
                                        <Text style={styles.text}>{item.category}</Text>
                                    </View>

                                    <Text style={styles.text}>RM</Text>
                                    <View
                                        style={{
                                            width: '30%',
                                            alignItems: 'flex-end',
                                        }}
                                    >
                                        <Text style={styles.text}>{item.total.toFixed(2)}</Text>
                                    </View>
                                </HStack>
                            );
                        }
                    })}
            </VStack>
        );
    };

    const transactionsByMonth = (transactions: TransactionProps[]) => {
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
                expensePerMonth: expenseTotalByMonth,
                incomePerMonth: incomeTotalByMonth,
            };
        });

        return transactionByMonthArray;
    }

    useEffect(() => {
        // Calculate total for expense and income categories
        if (transactions) {
            setExpenseTotal(getTransactionBreakdownByType(EXPENSE_CATEGORIES, TransactionType.EXPENSE).reduce((sum, { total }) => sum + total, 0));
            setIncomeTotal(getTransactionBreakdownByType(INCOME_CATEGORIES, TransactionType.INCOME).reduce((sum, { total }) => sum + total, 0));
        }
    }, [transactions]);

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='transactions'
        />
    );

    if (queryState) return queryState;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Bar Chart */}
            <View style={[styles.centered, {
                height: "40%",
                paddingVertical: 10,
            }]}>
                <View style={{
                    width: '95%',
                    height: "100%",
                }}>
                    {transactions ? <VStack
                        style={{
                            flex: 1,
                        }}
                    >
                        <CartesianChart data={
                            transactionsByMonth(transactions as TransactionProps[])
                        }
                            xKey="month"
                            xAxis={{
                                font,
                                tickCount: 12,
                                formatXLabel: (value) => {
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    return monthNames[(value - 1) % 12];
                                },
                            }}
                            yKeys={["expensePerMonth", "incomePerMonth"]}
                            axisOptions={{
                                font,
                                lineColor: "#d4d4d8",
                            }}
                            domainPadding={{ left: 20, right: 20, top: 30 }}
                        >
                            {({ points, chartBounds }) => (
                                // Bar Group
                                <BarGroup
                                    chartBounds={chartBounds}
                                    betweenGroupPadding={0.3}
                                    withinGroupPadding={0.1}
                                >
                                    <BarGroup.Bar points={points.expensePerMonth} color={TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]} />
                                    <BarGroup.Bar points={points.incomePerMonth} color={TRANSACTION_TYPE_COLORS[TransactionType.INCOME]} />
                                </BarGroup>
                            )}
                        </CartesianChart>
                        {/* Legends */}
                        <HStack className='justify-center items-center'>
                            <Box
                                className="w-5 h-5 rounded"
                                style={{
                                    backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                                }}
                            />
                            <Text style={[styles.text, {
                                marginHorizontal: 5
                            }]}>Expense</Text>
                            <Box
                                className="w-5 h-5 rounded"
                                style={{
                                    backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                                }}
                            />
                            <Text style={[styles.text, {
                                marginHorizontal: 5
                            }]}>Income</Text>
                        </HStack>
                    </VStack>
                        : <View style={styles.centeredFlex}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>No transaction data available.</Text>
                        </View>}
                </View>
            </View>

            <ScrollView>
                <View style={{
                    margin: 10,
                }}>
                    {/* Expense Heading */}
                    <HStack
                        className='justify-between'
                        style={{
                            padding: 20,
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                            borderRadius: 20,
                            alignItems: 'center',
                        }}>
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            textDecorationLine: 'underline',
                        }]}>Top 5 Expense Categories</Text>
                    </HStack>
                    {/* Expense Total by Categories */}
                    {transactions && <TransactionsListing type="expense" />}

                    {/* Income Heading */}
                    <HStack
                        className='justify-between'
                        style={{
                            padding: 20,
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                            borderRadius: 20,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            textDecorationLine: 'underline',
                        }]}>Top 5 Income Categories</Text>
                    </HStack>
                    {/* Income Total by Categories */}
                    {transactions && <TransactionsListing type="income" />}
                </View>

                {/* Reserve Space for Floating Action Button */}
                <View style={{ minHeight: 60 }}/>
            </ScrollView>

            {/* Floating action button to add new transaction */}
            <Fab
                size="lg"
                placement="bottom right"
                onPress={() => router.navigate(`/transaction/` as Href)}
            >
                <FabIcon as={AddIcon} size='xl' />
            </Fab>
        </SafeAreaView>
    );
};

export default TransactionScreen;
