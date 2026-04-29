import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableNativeFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import QueryState from '@/components/QueryState';
import TransactionForm from '@/components/TransactionForm';
import { TRANSACTION_TYPE_COLORS } from '@/constants/colors';
import { useScanContext } from '@/hooks/useScanContext';
import useShowToast from '@/hooks/useShowToast';
import { useDeleteTransaction, useTransaction } from '@/hooks/useTransactions';
import { useTransactionFormik } from '@/hooks/useTransactionsFormik';
import { TransactionType, TransactionTypeValue } from '@/types';

const TransactionManager = () => {
  const { scannedData } = useScanContext();
  const hasScannedData = scannedData.length > 0;
  const { scanNum = 0, transactionId } = useLocalSearchParams();
  const navigation = useNavigation();
  const showToast = useShowToast(); // Use the useShowToast hook (custom)
  const [formAction, setFormAction] = useState<'create' | 'update'>('create');
  const [transactionType, setTransactionType] = useState<TransactionTypeValue>(
    TransactionType.EXPENSE,
  );
  const {
    data: transaction,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
    isRefetchError,
    refetch,
  } = useTransaction(Number(transactionId));
  const deleteMutation = useDeleteTransaction();

  // Formik setup
  const { transactionFormik: formik } = useTransactionFormik(
    transactionType,
    formAction,
    scannedData,
    Number(scanNum),
    Number(transactionId),
  );

  useEffect(() => {
    if (transaction) {
      // Set the current transaction type
      setTransactionType(transaction.type);
      // Set the formik values
      formik.setValues({
        date: transaction.date ? [transaction.date.toString()] : [''],
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount.toString(),
        description: transaction.description,
        recurring: transaction.recurring,
        recurring_frequency: transaction.recurring_frequency
          ? {
              frequency: transaction.recurring_frequency.frequency,
              time: {
                month:
                  transaction.recurring_frequency.time.month?.toString() ?? '',
                day: transaction.recurring_frequency.time.day ?? '',
                date:
                  transaction.recurring_frequency.time.date?.toString() ?? '',
              },
            }
          : {
              frequency: '',
              time: {
                month: '',
                day: '',
                date: '',
              },
            },
      });
    }
    // Set the title for the screen
    const isNewTransaction = transactionId === 'new';
    navigation.setOptions({
      title: isNewTransaction ? 'Create New Transaction' : 'Edit Transaction',
    });

    // Show toast if transaction is not found
    if (!isNewTransaction && isSuccess && !transaction) {
      showToast({ action: 'info', messages: 'Transaction not found' });
      router.back();
    }
    // Fill in scanned data after scanning
    if (hasScannedData && isNewTransaction) {
      formik.setValues({
        ...scannedData[Number(scanNum)],
        amount: scannedData[Number(scanNum)].amount.toString(),
      });
    }
  }, [transaction, hasScannedData, scannedData]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='transaction'
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
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: '#fff',
        }}
      >
        <VStack className='flex-1 p-4'>
          {!transaction && (
            <HStack
              style={[
                styles.centeredFlex,
                {
                  flexDirection: 'row',
                  minHeight: '10%',
                },
              ]}
            >
              <TouchableNativeFeedback
                onPress={() => setTransactionType(TransactionType.EXPENSE)}
              >
                <View
                  style={[
                    styles.centered,
                    {
                      minWidth: 120,
                      padding: 20,
                      marginHorizontal: 20,
                      backgroundColor:
                        TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                      borderRadius: 20,
                      borderWidth:
                        transactionType === TransactionType.EXPENSE ? 3 : 0,
                    },
                  ]}
                >
                  <Text style={styles.boldText}>Expense</Text>
                </View>
              </TouchableNativeFeedback>

              <Divider
                orientation='vertical'
                className='mx-5 h-full bg-black'
              />

              <TouchableNativeFeedback
                onPress={() => setTransactionType(TransactionType.INCOME)}
              >
                <View
                  style={[
                    styles.centered,
                    {
                      minWidth: 120,
                      padding: 20,
                      marginHorizontal: 20,
                      backgroundColor:
                        TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                      borderRadius: 20,
                      borderWidth:
                        transactionType === TransactionType.INCOME ? 3 : 0,
                    },
                  ]}
                >
                  <Text style={styles.boldText}>Income</Text>
                </View>
              </TouchableNativeFeedback>
            </HStack>
          )}

          {/* Transaction Form */}
          <TransactionForm
            formik={formik}
            transactionType={transactionType}
            isExistingTransaction={!!transaction}
            onTransactionTypeChange={setTransactionType}
          />

          {/* Icon Group */}
          {!transaction && (
            <HStack className='my-4 justify-between'>
              <TouchableNativeFeedback
                onPress={() => {
                  formik.setValues({
                    ...formik.values,
                    date:
                      formik.values.date.length > 0
                        ? []
                        : [new Date().toString()],
                    recurring: !formik.values.recurring,
                  });
                }}
              >
                <View
                  style={[
                    styles.centered,
                    {
                      height: 75,
                      width: 75,
                    },
                  ]}
                >
                  {formik.values.recurring ? (
                    <MaterialCommunityIcons
                      name='repeat'
                      size={65}
                      color='black'
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name='repeat-off'
                      size={65}
                      color='black'
                    />
                  )}
                </View>
              </TouchableNativeFeedback>
              {transactionType === TransactionType.EXPENSE &&
                !formik.values.recurring && (
                  <TouchableNativeFeedback
                    onPress={() => router.navigate('/transaction/scan' as Href)}
                  >
                    <View
                      style={[
                        styles.centered,
                        {
                          height: 75,
                          width: 75,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name='camera-outline'
                        size={80}
                        color='black'
                      />
                    </View>
                  </TouchableNativeFeedback>
                )}
            </HStack>
          )}

          {/* Button Group */}
          {transaction ? (
            <HStack className='mt-4 justify-between'>
              <Button
                size='lg'
                onPress={() => deleteMutation.mutate(Number(transaction.id))}
                action='negative'
              >
                <ButtonText>Delete</ButtonText>
              </Button>

              <Button
                size='lg'
                onPress={() => {
                  setFormAction('update');
                  formik.handleSubmit();
                }}
                action='positive'
              >
                <ButtonText>Save</ButtonText>
              </Button>
            </HStack>
          ) : (
            <View className='mt-4'>
              <Button
                className='self-center'
                size='lg'
                onPress={() => {
                  setFormAction('create');
                  formik.setFieldValue('type', transactionType);
                  formik.handleSubmit();
                }}
                action='positive'
              >
                <ButtonText>Create</ButtonText>
              </Button>
            </View>
          )}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionManager;
