import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import QueryState from '@/components/QueryState';
import TransferForm from '@/components/TransferForm';
import { useAccounts } from '@/hooks/useAccounts';
import useShowToast from '@/hooks/useShowToast';
import { useDeleteTransfer, useTransfer } from '@/hooks/useTransfers';
import { useTransferFormik } from '@/hooks/useTransfersFormik';

const TransferManager = () => {
  const { transferId } = useLocalSearchParams();
  const navigation = useNavigation();
  const showToast = useShowToast();
  const [formAction, setFormAction] = useState<'create' | 'update'>('create');
  const {
    data: transfer,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
    isRefetchError,
    refetch,
  } = useTransfer(Number(transferId));
  const deleteMutation = useDeleteTransfer();
  const { data: accounts = [] } = useAccounts();

  // Formik setup
  const { transferFormik: formik } = useTransferFormik(
    formAction,
    Number(transferId),
  );

  useEffect(() => {
    formik.setFieldValue('fromAccountId', accounts[0]?.id?.toString() || '');
    if (transfer) {
      formik.setValues({
        date: transfer.date.toString(),
        fromAccountId: transfer.fromAccountId.toString(),
        toAccountId: transfer.toAccountId.toString(),
        amount: transfer.amount.toString(),
        description: transfer.description,
        currency: transfer.currency,
      });
    }

    // Set the title for the screen
    const isNewTransfer = transferId === 'new';
    navigation.setOptions({
      title: isNewTransfer ? 'Create New Transfer' : 'Edit Transfer',
      headerRight: () =>
        isNewTransfer && (
          <TouchableOpacity onPress={() => router.replace(`/transaction/new`)}>
            <AntDesign
              name='swap'
              size={24}
              color='white'
            />
          </TouchableOpacity>
        ),
    });

    // Show toast if transfer is not found
    if (!isNewTransfer && isSuccess && !transfer) {
      showToast({ action: 'info', messages: 'Transfer not found' });
      router.back();
    }
  }, [transfer, transferId]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='transfer'
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
        <VStack className='flex-1 px-4'>
          {/* Transfer Form */}
          <TransferForm
            formik={formik}
            accounts={accounts}
            primaryAccount={accounts[0]}
          />

          {/* Button Group */}
          {transfer ? (
            <HStack className='mt-4 justify-between'>
              <Button
                size='lg'
                onPress={() => deleteMutation.mutate(Number(transfer.id))}
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

export default TransferManager;
