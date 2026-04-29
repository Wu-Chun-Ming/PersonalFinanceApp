import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';

// Gluestack UI
import { Button } from '@/components/ui/button';

// Custom import
import styles from '@/app/styles';
import QueryState from '@/components/QueryState';
import TransactionFilterForm from '@/components/TransactionFilterForm';
import TransactionListing from '@/components/TransactionListing';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/transaction';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useScanContext } from '@/hooks/useScanContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionFilterFormik } from '@/hooks/useTransactionsFormik';
import { RecurringFrequency, TransactionTypeValue } from '@/types';

const TransactionListScreen = () => {
  const navigation = useNavigation();
  // Filters
  const { date, type, category, amount, recurring, frequency } =
    useLocalSearchParams();
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(true);
  const { scannedData } = useScanContext();
  const hasScannedData = scannedData.length > 0;

  // Transactions Data
  const {
    data: transactions,
    isLoading,
    isError,
    isRefetchError,
    isRefetching,
    refetch,
  } = useTransactions();

  // Formik setup
  const { transactionFilterFormik: formik } = useTransactionFilterFormik({
    date: date ? (Array.isArray(date) ? date : [date]) : [],
    type: type?.toString(),
    category: category?.toString(),
    amount: amount?.toString(),
    recurring: recurring?.toString(),
    frequency: frequency?.toString(),
  });

  const dates = formik.values.date;
  const hasMultipleDates = dates.length > 1;
  const filteredTransactions = useFilteredTransactions(transactions ?? [], {
    date: dates.length === 1 ? new Date(dates[0]) : undefined,
    startDate: hasMultipleDates ? new Date(dates[0]) : undefined,
    endDate: hasMultipleDates ? new Date(dates[dates.length - 1]) : undefined,
    type: formik.values.type
      ? (formik.values.type as TransactionTypeValue)
      : undefined,
    category: formik.values.category
      ? (formik.values.category as
          | (typeof EXPENSE_CATEGORIES)[number]
          | (typeof INCOME_CATEGORIES)[number])
      : undefined,
    amount: formik.values.amount ? Number(formik.values.amount) : undefined,
    recurring: formik.values.recurring
      ? formik.values.recurring === 'true'
        ? true
        : false
      : undefined,
    frequency: formik.values.frequency
      ? (formik.values.frequency as RecurringFrequency)
      : undefined,
  });

  useEffect(() => {
    if (hasScannedData) {
      navigation.setOptions({
        title: 'Pending Transactions',
      });
    }
  }, [hasScannedData, navigation]);

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
      style={{
        flex: 1,
        backgroundColor: '#25292e',
      }}
      edges={['bottom']}
    >
      {/* Button to toggle filter visibility */}
      <Button
        onPress={() => setIsFiltersCollapsed((prevState) => !prevState)}
        style={{
          margin: 5,
          borderRadius: 8,
          backgroundColor: '#595c62ff',
        }}
      >
        <Text
          style={[
            styles.text,
            {
              color: 'white',
            },
          ]}
        >
          {(isFiltersCollapsed ? 'Show' : 'Hide') + ' Filters'}
        </Text>
      </Button>

      {/* Transaction Filter Form */}
      <TransactionFilterForm
        isCollapsed={isFiltersCollapsed}
        formik={formik}
      />

      {/* Transaction Listing */}
      <TransactionListing
        data={hasScannedData ? scannedData : filteredTransactions}
        isFromScan={hasScannedData}
      />
    </SafeAreaView>
  );
};

export default TransactionListScreen;
