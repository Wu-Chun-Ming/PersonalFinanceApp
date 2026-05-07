import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Gluestack UI
import { HStack } from '@/components/ui/hstack';

// Custom import
import styles from '@/app/styles';
import BarChart from '@/components/BarChart';
import QueryState from '@/components/QueryState';
import TransactionBreakdown from '@/components/TransactionBreakdown';
import YearSelector from '@/components/YearSelector';
import { TRANSACTION_TYPE_COLORS } from '@/constants/colors';
import { TRANSACTION_TYPES } from '@/constants/transaction';
import {
  useTransactionData,
  useTransactions,
  useTransactionSummary,
  useTransactionYears,
} from '@/hooks/useTransactions';
import {
  TransactionCategoryType,
  TransactionType,
  TransactionTypeValue,
} from '@/types';

const TransactionBreakdownScreen = () => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    isRefetchError,
    isRefetching,
    refetch,
  } = useTransactions();
  const { data: availableTxYears = [] } = useTransactionYears();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { selectedYearTransactions } = useTransactionData(
    transactions,
    selectedYear,
  );
  const shouldRenderBarChart =
    selectedYearTransactions && selectedYearTransactions.length > 0;
  const {
    transactionTotalsPerCategory: selectedYearTxTotalsPerCategory,
    transactionTotalsPerMonth: selectedYearTxTotalsPerMonth,
  } = useTransactionSummary(selectedYearTransactions);

  // Get top 5 transaction breakdown by transaction type
  const getTransactionBreakdownByType = (
    transactionType: TransactionTypeValue,
  ) =>
    Object.entries(selectedYearTxTotalsPerCategory)
      .filter(([category]) =>
        transactions.some(
          (t) => t.category === category && t.type === transactionType,
        ),
      )
      .map(([category, total]) => ({
        category: category as TransactionCategoryType,
        total,
      }))
      .sort((a, b) => b.total - a.total) // Sort in descending order by 'total'
      .slice(0, 5); // Limit to the top 5 categories

  useEffect(() => {
    if (availableTxYears && availableTxYears.length > 0) {
      setSelectedYear(availableTxYears[availableTxYears.length - 1]);
    }
  }, [availableTxYears]);

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
      <YearSelector
        onYearChange={(year) => setSelectedYear(year)}
        yearRange={availableTxYears}
      />
      {/* Bar Chart */}
      <View
        style={[
          styles.centered,
          {
            height: '50%',
            paddingVertical: 10,
          },
        ]}
      >
        <View
          style={{
            width: '95%',
            height: '100%',
          }}
        >
          {shouldRenderBarChart ? (
            <BarChart
              data={selectedYearTxTotalsPerMonth}
              xKey='month'
              yKeys={[
                [
                  'expensePerMonth',
                  TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                ],
                [
                  'incomePerMonth',
                  TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                ],
              ]}
              legends={[
                ['Expense', TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                ['Income', TRANSACTION_TYPE_COLORS[TransactionType.INCOME]],
              ]}
            />
          ) : (
            <View style={styles.centeredFlex}>
              <Text style={styles.boldText}>
                No transactions for {selectedYear}.
              </Text>
              <Text
                style={[
                  styles.text,
                  {
                    marginTop: 10,
                  },
                ]}
              >
                Try selecting another year or start adding transactions.
              </Text>
            </View>
          )}
        </View>
      </View>

      {shouldRenderBarChart && (
        <ScrollView
          style={{
            margin: 10,
          }}
        >
          {/* Transactions Breakdown */}
          {TRANSACTION_TYPES.map((type, index) => (
            <View key={index}>
              <HStack
                className='justify-between'
                style={{
                  backgroundColor: TRANSACTION_TYPE_COLORS[type],
                  paddingHorizontal: 20,
                  paddingVertical: 15,
                  borderRadius: 20,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={[
                    styles.boldText,
                    {
                      textDecorationLine: 'underline',
                    },
                  ]}
                >
                  Top 5 {type.charAt(0).toUpperCase() + type.slice(1)}{' '}
                  Categories
                </Text>
                <TouchableNativeFeedback
                  onPress={() =>
                    router.navigate(
                      `/transaction/listing?type=${type}&recurring=false`,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.text,
                      {
                        backgroundColor:
                          type === TransactionType.EXPENSE
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
              {/* Total by Categories */}
              {transactions && (
                <TransactionBreakdown
                  data={getTransactionBreakdownByType(type)}
                  onItemPress={(item) =>
                    router.navigate(
                      `/transaction/listing?type=${type}&category=${item.category}&recurring=false`,
                    )
                  }
                />
              )}
            </View>
          ))}

          {/* Reserve Space for Floating Action Button */}
          <View style={{ minHeight: 60 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default TransactionBreakdownScreen;
