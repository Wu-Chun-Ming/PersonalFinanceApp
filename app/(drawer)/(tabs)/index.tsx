import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Pie, PolarChart } from 'victory-native';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';

// Custom import
import styles from '@/app/styles';
import { ActionFab } from '@/components/ActionFab';
import QueryState from '@/components/QueryState';
import TransactionBreakdown from '@/components/TransactionBreakdown';
import { TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { TransactionCategory, TransactionType } from '@/constants/Types';
import {
  usePieChartTransactions,
  useTransactionData,
  useTransactions,
  useTransactionSummary,
} from '@/hooks/useTransactions';

const App = () => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch
  } = useTransactions();
  const {
    expenseTransactions,
    incomeTransactions,
  } = useTransactionData();
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const {
    transactionsPerCategory,
  } = usePieChartTransactions(expenseTransactions, incomeTransactions, transactionType);
  const {
    totalByCategory,
    percentageByCategory,
  } = useTransactionSummary((transactionType === TransactionType.EXPENSE) ? expenseTransactions : incomeTransactions);

  const transactionBreakdown = Object.values(TransactionCategory).map((category) => {
    return {
      category,
      total: totalByCategory[category] || 0,
      percentage: percentageByCategory[category] || 0,
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
    <SafeAreaView style={{ flex: 1 }}>
      <Dropdown
        data={[
          { label: 'Expense', value: 'expense' },
          { label: 'Income', value: 'income' },
        ]}
        labelField="label"
        valueField="value"
        value={transactionType}
        onChange={(item) => setTransactionType(item.value)}
        style={{
          margin: 10,
          padding: 5,
          paddingLeft: 10,
          borderWidth: 1,
          borderRadius: 10,
          maxWidth: '25%',
        }}
        itemTextStyle={{
          justifyContent: 'center',
          textAlign: 'center',
        }}
      />

      {/* Pie Chart */}
      <View style={{
        height: "40%",
        paddingVertical: 10,
      }}>
        {(transactionsPerCategory && transactionsPerCategory.length > 0) ?
          <PolarChart
            data={transactionsPerCategory}
            labelKey={"label"}
            valueKey={"value"}
            colorKey={"color"}
          >
            <Pie.Chart />
          </PolarChart>
          : <View style={styles.centeredFlex}>
            <Text style={[styles.text, {
              fontWeight: 'bold',
            }]}>No data available.</Text>
          </View>}
      </View>

      <ScrollView>
        <View style={{
          margin: 10,
        }}>
          <View style={{
            paddingHorizontal: 20,
            paddingVertical: 15,
            backgroundColor: TRANSACTION_TYPE_COLORS[transactionType],
            borderRadius: 20,
          }}>
            <HStack className='justify-between items-center'>
              <Heading style={{
                textDecorationLine: 'underline',
              }}>
                {transactionType[0].toUpperCase() + transactionType.slice(1)}
              </Heading>
              <TouchableNativeFeedback
                onPress={() => router.navigate(`/transaction/listing?type=${transactionType}`)}
              >
                <Text style={[styles.text, {
                  backgroundColor: transactionType === TransactionType.EXPENSE ? '#2bae2bff' : '#bebe09ff',
                  padding: 8,
                  borderRadius: 10,
                }]}>View All</Text>
              </TouchableNativeFeedback>
            </HStack>
          </View>
          {/* Total by Category */}
          {transactionsPerCategory && <TransactionBreakdown data={transactionBreakdown} type={transactionType} />}
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

export default App;
