import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { RRule } from 'rrule';
import { Pie, PolarChart } from 'victory-native';

// Gluestack UI
import { Box } from '@/components/ui/box';
import { Fab, FabIcon } from '@/components/ui/fab';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import QueryState from '@/components/QueryState';
import { CATEGORY_COLORS, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionProps, TransactionType } from '@/constants/Types';
import { initializeDatabase } from '@/db/database';
import { createTransaction } from '@/db/transactions';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useTransactions } from '@/hooks/useTransactions';

const App = () => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [lastOpenDate, setLastOpenDate] = useState<Date | undefined>();
  const {
    data: transactions,
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch
  } = useTransactions();
  const nonRecurringTransactions = useFilteredTransactions(transactions ?? [], {
    recurring: false,
  });
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
  const recurringTransactionsFromLastOpen = useFilteredTransactions(transactions ?? [], {
    recurring: true,
    startDate: lastOpenDate,
    endDate: new Date(),
  });

  // Check if the database has been initialized
  const checkDatabaseInitialization = async () => {
    try {
      const dbInitialized = await SecureStore.getItemAsync('dbInitialized');

      // Create the database if not initialized
      if (!dbInitialized) {
        await initializeDatabase();
        await SecureStore.setItemAsync('dbInitialized', 'true');
        setDbInitialized(true);
      }
    } catch (error) {
      console.error('Error checking database initialization:', (error as Error).message);
    }
  };

  // Add transaction(s) based on recurring transactions in the database
  const handleRecurringTransactions = async (recurringTransactions: TransactionProps[]) => {
    try {
      const todayDateObj = new Date();

      if (lastOpenDate) {
        let lastOpenDateObj = new Date(lastOpenDate.getTime());
        lastOpenDateObj.setDate(lastOpenDateObj.getDate() + 1);     // Exclude last open date

        if (lastOpenDateObj < todayDateObj) {
          // Format to `YYYYMMDDTHHmmss`
          const lastOpenDate = lastOpenDateObj.toISOString().replace(/[-:]/g, '').split('.')[0];
          const today = todayDateObj.toISOString().replace(/[-:]/g, '').split('.')[0];
          for (const transaction of recurringTransactions) {
            if (!transaction.recurring_frequency) continue;
            const { frequency: freq, time } = transaction.recurring_frequency;
            const { month, day, date } = time;

            let rruleStr = `DTSTART:${lastOpenDate}\nRRULE:`;
            if (freq) rruleStr += `FREQ=${freq};`;
            if (month) rruleStr += `BYMONTH=${month};`;
            if (day) rruleStr += `BYDAY=${day};`;
            if (date) rruleStr += `BYMONTHDAY=${date};`;
            rruleStr += `UNTIL=${today}`

            const rule = RRule.fromString(rruleStr);
            for (const recurringDate of rule.all()) {
              await createTransaction({
                ...transaction,
                date: recurringDate,
                recurring: false,
                recurring_frequency: null,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating recurring transactions:', (error as Error).message);
    }
  };

  useEffect(() => {
    checkDatabaseInitialization();
    const fetchLastOpen = async () => {
      const lastOpenDateStr = await SecureStore.getItemAsync('lastOpenDate');
      if (lastOpenDateStr) {
        setLastOpenDate(new Date(lastOpenDateStr));
      }
    };
    fetchLastOpen();
    const updateLastOpen = async () => {
      const today = new Date().toISOString();
      await SecureStore.setItemAsync('lastOpenDate', today);
    };
    if (isSuccess && !isLoading && !isRefetching && recurringTransactionsFromLastOpen.length > 0) {
      handleRecurringTransactions(recurringTransactionsFromLastOpen);
      updateLastOpen();
    }
  }, [dbInitialized, transactions]);

  // Filter the transactions by transaction type and category
  const filterTransactions = (transactions: TransactionProps[], type: TransactionType) => {
    const categories = type === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const transactionsByType = transactions.filter((transaction) => transaction.type === type);
    const totalsMap: Record<TransactionCategory, number> = {} as Record<TransactionCategory, number>;

    // Calculate totals for each category
    for (const transaction of transactionsByType) {
      const category = transaction.category;
      if (!totalsMap[category]) {
        totalsMap[category] = 0;
      }
      totalsMap[category] += transaction.amount;
    }

    return categories.map(category => ({
      label: category,
      value: totalsMap[category] || 0,
      color: CATEGORY_COLORS[category],
    }));
  }

  // Calculate the total amount based on transaction type and category
  const TransactionBreakdown = ({ type }: { type: 'expense' | 'income' }) => {
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const transactionsByType = nonRecurringTransactions.filter((transaction) => transaction.type === type);

    const grandTotal = transactionsByType.reduce((sum, t) => sum + t.amount, 0);
    // Calculate total amount for each category
    const transactionTotalByCategory = transactionsByType.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;      // Add transaction amount to the respective category
      return acc;
    }, {});

    const transactionBreakdownByType = categories.map((category) => {
      // Calculate percentage of total
      const percentage = grandTotal ? (transactionTotalByCategory[category] / grandTotal) * 100 : 0;

      return {
        category,
        total: transactionTotalByCategory[category] || 0,
        percentage,
      };
    });

    return (
      <VStack>
        {transactionBreakdownByType.map((item, index) => {
          if (item.total != 0) {
            return (
              <HStack
                key={index}
                className='justify-between items-center mx-5 my-2'
              >
                {/* Color Box */}
                <Box
                  className="w-5 h-5 rounded"
                  style={{
                    backgroundColor: CATEGORY_COLORS[item.category],
                  }} />
                <TouchableNativeFeedback
                  onPress={() => router.navigate(`/transaction/listing?type=${type}&category=${item.category}&recurring=false`)}
                >
                  {/* Category Label */}
                  <View style={[styles.centered, {
                    width: '40%',
                    padding: 5,
                    borderRadius: 10,
                    backgroundColor: CATEGORY_COLORS[item.category],
                  }]}>
                    <Text style={styles.text}>{item.category}</Text>
                  </View>
                </TouchableNativeFeedback>
                {/* Currency Label */}
                <Text style={styles.text}>RM</Text>
                {/* Total Amount and Percentage */}
                <View
                  style={{
                    width: '30%',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={styles.text}>{item.total.toFixed(2)}</Text>
                  <Text>({item.percentage.toFixed(2)}%)</Text>
                </View>
              </HStack>
            );
          }
        })}
      </VStack>
    );
  };

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
        {transactions ?
          <PolarChart
            data={filterTransactions(nonRecurringTransactions, transactionType)}
            labelKey={"label"}
            valueKey={"value"}
            colorKey={"color"}
          >
            <Pie.Chart/>
          </PolarChart>
          : <View style={styles.centeredFlex}>
            <Text style={[styles.text, {
              fontWeight: 'bold',
            }]}>No transaction data available.</Text>
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
          {transactions && <TransactionBreakdown type={transactionType} />}
        </View>

        {/* Reserve Space for Floating Action Button */}
        <View style={{ minHeight: 60 }}/>
      </ScrollView>

      {/* Floating action button to add new transaction */}
      <Fab
        size="lg"
        placement="bottom right"
        onPress={() => router.navigate(`/transaction/new`)}
      >
        <FabIcon as={AddIcon} size='xl' />
      </Fab>
    </SafeAreaView>
  );
};

export default App;
