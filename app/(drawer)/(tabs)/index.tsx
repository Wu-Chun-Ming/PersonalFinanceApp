import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import dayjs from 'dayjs';

// Gluestack UI
import { AddIcon } from '@/components/ui/icon';

// Custom import
import styles from '@/app/styles';
import ActionFab from '@/components/ActionFab';
import QueryState from '@/components/QueryState';
import TransactionBreakdown from '@/components/TransactionBreakdown';
import { TRANSACTION_CATEGORIES } from '@/constants/transaction';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import {
  useTransactions,
  useTransactionSummary,
} from '@/hooks/useTransactions';
import { formatAmount } from '@/utils/amount';

const App = () => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch,
  } = useTransactions({
    sortOptions: { sortField: 'date', sortOrder: 'DESC' },
  });
  const now = dayjs();
  const today = now.format('YYYY-MM-DD');
  const [selectedYear, setSelectedYear] = useState(now.year());
  const [selectedMonth, setSelectedMonth] = useState(now.month() + 1); // 1-12 for months
  const monthStart = dayjs(`${selectedYear}-${selectedMonth}-01`);
  const gridStart = monthStart.startOf('month').startOf('week');
  const gridDays = Array.from({ length: 42 }).map((_, i) =>
    gridStart.add(i, 'day'),
  );
  const startDate = gridDays[0].format('YYYY-MM-DD');
  const endDate = gridDays[41].format('YYYY-MM-DD');

  const selectedPeriodTransactions = useFilteredTransactions(transactions, {
    startDate,
    endDate,
  });
  const currentMonthTransactions = useFilteredTransactions(
    selectedPeriodTransactions,
    {
      startDate: monthStart.format('YYYY-MM-DD'),
      endDate: monthStart.endOf('month').format('YYYY-MM-DD'),
    },
  );
  const { transactionsPerDay } = useTransactionSummary(
    selectedPeriodTransactions,
  );
  const { transactionTotalsPerCategory } = useTransactionSummary(
    currentMonthTransactions,
  );

  const transactionBreakdown = TRANSACTION_CATEGORIES.map((category) => {
    return {
      category,
      total: transactionTotalsPerCategory[category] || 0,
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
      <Calendar
        showSixWeeks={true}
        dayComponent={({ date, state }) => {
          if (!date) return null;

          const isToday = date.dateString === today;

          const income = transactionsPerDay[date.dateString]?.income;
          const expense = transactionsPerDay[date.dateString]?.expense;

          return (
            <Pressable
              onPress={() => {
                router.navigate(`/transaction/listing?date=${date.dateString}`);
              }}
            >
              <View
                style={[
                  styles.centered,
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isToday ? '#007AFF' : 'transparent',
                  },
                ]}
              >
                {/* Day number */}
                <Text
                  style={{
                    color: isToday
                      ? 'white'
                      : state === 'disabled'
                        ? 'gray'
                        : 'black',
                    fontWeight: '600',
                  }}
                >
                  {date.day}
                </Text>

                {/* Income */}
                {income > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'green',
                    }}
                  >
                      +${formatAmount(income)}
                  </Text>
                )}

                {/* Expense */}
                {expense > 0 && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: 'red',
                    }}
                  >
                    -${formatAmount(expense)}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
        onMonthChange={(month) => {
          setSelectedYear(month.year);
          setSelectedMonth(month.month);
        }}
      />

      <ScrollView
        style={{
          margin: 10,
        }}
      >
        {/* Total by Category */}
        {selectedPeriodTransactions && (
          <TransactionBreakdown
            data={transactionBreakdown}
            onItemPress={(item) =>
              router.navigate(
                `/transaction/listing?category=${item.category}&recurring=false&year=${selectedYear}&month=${selectedMonth}`,
              )
            }
          />
        )}

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
