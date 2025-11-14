import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';

// Gluestack UI
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { ActionFab } from '@/components/ActionFab';
import BarChart from '@/components/BarChart';
import QueryState from '@/components/QueryState';
import YearSelector from '@/components/YearSelector';
import { CATEGORY_COLORS, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';
import { useTransactionData, useTransactions } from '@/hooks/useTransactions';

const TransactionScreen = () => {
    const {
        data: transactions = [],
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useTransactions();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { selectedYearTransactions } = useTransactionData(selectedYear);

    // Calculate the total amount based on transaction type and category
    const getTransactionBreakdownByType = (selectedYearTransactions: TransactionProps[], categories: TransactionCategory[], transactionType: TransactionType) => {
        const filteredTransactions = selectedYearTransactions.filter(transaction => transaction.type === transactionType);
        const totalsMap: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;

        // Calculate totals for each category
        for (const transaction of filteredTransactions) {
            const category = transaction.category;
            if (!totalsMap[category]) {
                totalsMap[category] = 0;
            }
            totalsMap[category] += transaction.amount;
        }

        return categories.map(category => ({
            category,
            total: totalsMap[category] || 0,
        }));
    };

    const TransactionsListing = ({ type }: { type: "expense" | "income" }) => {
        const transactionType = type === 'expense' ? TransactionType.EXPENSE : TransactionType.INCOME;
        const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

        return (
            <VStack>
                {(getTransactionBreakdownByType(selectedYearTransactions, categories, transactionType))
                    .sort((a, b) => b.total - a.total)  // Sort in descending order by 'amount'
                    .slice(0, 5)  // Limit to the top 5 categories
                    .map((item, index) => {
                        if (item.total !== 0) {
                            return (
                                <HStack
                                    key={index}
                                    className='justify-between'
                                    style={{
                                        marginHorizontal: 20,
                                        marginVertical: 10,
                                    }}
                                >
                                    <TouchableNativeFeedback
                                        onPress={() => router.navigate(`/transaction/listing?type=${type}&category=${item.category}&recurring=false`)}
                                    >
                                        <View style={{
                                            width: '50%',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            padding: 5,
                                            borderRadius: 10,
                                            backgroundColor: CATEGORY_COLORS[item.category],
                                        }}>
                                            <Text style={styles.text}>{item.category}</Text>
                                        </View>
                                    </TouchableNativeFeedback>

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

    const transactionsByMonth = (selectedYearTransactions: TransactionProps[]) => {
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
            expensePerMonth: expenseTotalByMonth[month] || 0,
            incomePerMonth: incomeTotalByMonth[month] || 0,
        }));

        return transactionByMonthArray;
    }

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='transactions'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <YearSelector
                onYearChange={(year) => setSelectedYear(year)}
            />
            {/* Bar Chart */}
            <View style={[styles.centered, {
                height: "40%",
                paddingVertical: 10,
            }]}>
                <View style={{
                    width: '95%',
                    height: "100%",
                }}>
                    {(selectedYearTransactions && selectedYearTransactions.length > 0) ?
                        <BarChart
                            data={transactionsByMonth(selectedYearTransactions)}
                            xKey='month'
                            yKeys={[
                                ['expensePerMonth', TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ['incomePerMonth', TRANSACTION_TYPE_COLORS[TransactionType.INCOME]],
                            ]}
                            legends={[
                                ['Expense', TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ['Income', TRANSACTION_TYPE_COLORS[TransactionType.INCOME]],
                            ]}
                        />
                        : <View style={styles.centeredFlex}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                            }]}>No data available.</Text>
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
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                            paddingHorizontal: 20,
                            paddingVertical: 15,
                            borderRadius: 20,
                            alignItems: 'center',
                        }}>
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            textDecorationLine: 'underline',
                        }]}>Top 5 Expense Categories</Text>
                        <TouchableNativeFeedback
                            onPress={() => router.navigate(`/transaction/listing?type=expense&recurring=false`)}
                        >
                            <Text style={[styles.text, {
                                backgroundColor: '#2bae2bff',
                                padding: 8,
                                borderRadius: 10,
                            }]}>View All</Text>
                        </TouchableNativeFeedback>
                    </HStack>
                    {/* Expense Total by Categories */}
                    {transactions && <TransactionsListing type="expense" />}

                    {/* Income Heading */}
                    <HStack
                        className='justify-between'
                        style={{
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                            paddingHorizontal: 20,
                            paddingVertical: 15,
                            borderRadius: 20,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            textDecorationLine: 'underline',
                        }]}>Top 5 Income Categories</Text>
                        <TouchableNativeFeedback
                            onPress={() => router.navigate(`/transaction/listing?type=income&recurring=false`)}
                        >
                            <Text style={[styles.text, {
                                padding: 8,
                                backgroundColor: '#bebe09ff',
                                borderRadius: 10,
                            }]}>View All</Text>
                        </TouchableNativeFeedback>
                    </HStack>
                    {/* Income Total by Categories */}
                    {transactions && <TransactionsListing type="income" />}
                </View>

                {/* Reserve Space for Floating Action Button */}
                <View style={{ minHeight: 60 }} />
            </ScrollView>

            {/* Floating action button to add new transaction */}
            <ActionFab
                href={`/transaction/new`}
                icon={AddIcon}
            />
        </SafeAreaView>
    );
};

export default TransactionScreen;
