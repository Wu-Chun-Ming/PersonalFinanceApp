import React, { useState } from 'react';
import { ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';

// Custom import
import styles from '@/app/styles';
import AppDropdown from '@/components/AppDropdown';
import QueryState from '@/components/QueryState';
import TransactionBreakdown from '@/components/TransactionBreakdown';
import { TRANSACTION_TYPE_COLORS } from '@/constants/colors';
import { MONTH_OPTIONS } from '@/constants/time';
import { TRANSACTION_CATEGORIES } from '@/constants/transaction';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import {
  usePieChartTransactions,
  useTransactionData,
  useTransactions,
  useTransactionSummary,
  useTransactionYears,
} from '@/hooks/useTransactions';
import { TransactionType, TransactionTypeValue } from '@/types';

const ALL_OPTION_VALUE = 0;

const TransactionOverviewScreen = () => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch,
  } = useTransactions();
  const { data: transactionYears = [] } = useTransactionYears();
  const [selectedYear, setSelectedYear] = useState(ALL_OPTION_VALUE);
  const [selectedMonth, setSelectedMonth] = useState(ALL_OPTION_VALUE); // 1-12 for months, 0 for all months
  const selectedPeriodTransactions = useFilteredTransactions(transactions, {
    year: selectedYear !== ALL_OPTION_VALUE ? selectedYear : undefined,
    month: selectedMonth !== ALL_OPTION_VALUE ? selectedMonth : undefined,
  });
  const { expenseTransactions, incomeTransactions } = useTransactionData(
    selectedPeriodTransactions,
  );
  const [transactionType, setTransactionType] = useState<TransactionTypeValue>(
    TransactionType.EXPENSE,
  );
  const filteredTransactions =
    transactionType === TransactionType.EXPENSE
      ? expenseTransactions
      : incomeTransactions;
  const { transactionsPerCategory } = usePieChartTransactions(
    filteredTransactions,
    transactionType,
  );
  const shouldRenderPieChart =
    transactionsPerCategory &&
    transactionsPerCategory.length &&
    Object.values(transactionsPerCategory).some((item) => item.value > 0);
  const { transactionTotalsPerCategory, percentagesPerCategory } =
    useTransactionSummary(filteredTransactions);

  const transactionBreakdown = TRANSACTION_CATEGORIES.map((category) => {
    return {
      category,
      total: transactionTotalsPerCategory[category] || 0,
      percentage: percentagesPerCategory[category] || 0,
    };
  });

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
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['bottom']}
    >
      <HStack
        className='justify-between items-center'
        style={{
          margin: 10,
        }}
      >
        <AppDropdown
          data={[
            { label: 'Expense', value: TransactionType.EXPENSE },
            { label: 'Income', value: TransactionType.INCOME },
          ]}
          value={transactionType}
          onChange={(value) => setTransactionType(value)}
          style={{
            padding: 5,
            paddingLeft: 10,
            borderWidth: 1,
            borderRadius: 10,
            width: '32%',
          }}
          itemTextStyle={styles.centeredText}
        />
        <AppDropdown
          data={[
            { label: 'All Years', value: ALL_OPTION_VALUE },
            ...transactionYears.map((year) => ({
              label: String(year),
              value: year,
            })),
          ]}
          value={selectedYear}
          placeholder='Year'
          onChange={(value) => setSelectedYear(value)}
          style={{
            padding: 5,
            paddingLeft: 10,
            borderWidth: 1,
            borderRadius: 10,
            width: '32%',
          }}
          itemTextStyle={styles.centeredText}
        />
        <AppDropdown
          data={[
            { label: 'All Months', value: ALL_OPTION_VALUE },
            ...MONTH_OPTIONS,
          ]}
          value={selectedMonth}
          placeholder='Month'
          onChange={(value) => setSelectedMonth(value)}
          style={{
            padding: 5,
            paddingLeft: 10,
            borderWidth: 1,
            borderRadius: 10,
            width: '32%',
          }}
          itemTextStyle={styles.centeredText}
        />
      </HStack>

      {/* Pie Chart */}
      <View
        style={[
          styles.centered,
          {
            height: '50%',
            paddingVertical: 10,
          },
        ]}
      >
        {shouldRenderPieChart ? (
          <PieChart data={transactionsPerCategory} />
        ) : (
          <View style={styles.centeredFlex}>
            <Text style={styles.boldText}>No data available.</Text>
          </View>
        )}
      </View>

      {shouldRenderPieChart && (
        <ScrollView
          style={{
            margin: 10,
          }}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 15,
              backgroundColor: TRANSACTION_TYPE_COLORS[transactionType],
              borderRadius: 20,
            }}
          >
            <HStack className='justify-between items-center'>
              <Heading
                style={{
                  textDecorationLine: 'underline',
                }}
              >
                {transactionType[0].toUpperCase() + transactionType.slice(1)}
              </Heading>
              <TouchableNativeFeedback
                onPress={() =>
                  router.navigate(
                    `/transaction/listing?type=${transactionType}`,
                  )
                }
              >
                <Text
                  style={[
                    styles.text,
                    {
                      backgroundColor:
                        transactionType === TransactionType.EXPENSE
                          ? '#2bae2bff'
                          : '#bebe09ff',
                      padding: 8,
                      borderRadius: 10,
                    },
                  ]}
                >
                  View All
                </Text>
              </TouchableNativeFeedback>
            </HStack>
          </View>
          {/* Total by Category */}
          <TransactionBreakdown
            data={transactionBreakdown}
            onItemPress={(item) =>
              router.navigate(
                `/transaction/listing?type=${transactionType}&category=${item.category}&recurring=false${selectedYear !== ALL_OPTION_VALUE ? `&year=${selectedYear}` : ''}${selectedMonth !== ALL_OPTION_VALUE ? `&month=${selectedMonth}` : ''}`,
              )
            }
            displayOptions={{
              colorBoxVisible: true,
              percentageVisible: true,
            }}
          />

          {/* Reserve Space for Floating Action Button */}
          <View style={{ minHeight: 60 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default TransactionOverviewScreen;
