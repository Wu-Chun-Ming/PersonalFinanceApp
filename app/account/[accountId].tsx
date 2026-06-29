import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import AccountForm from '@/components/AccountForm';
import QueryState from '@/components/QueryState';
import { useAccount, useDeleteAccount } from '@/hooks/useAccounts';
import { useAccountFormik } from '@/hooks/useAccountsFormik';
import { useInvestments, useInvestmentSummary } from '@/hooks/useInvestments';
import useShowToast from '@/hooks/useShowToast';
import { AccountType } from '@/types';

const AccountManager = () => {
  const { accountId } = useLocalSearchParams();
  const navigation = useNavigation();
  const showToast = useShowToast(); // Use the useShowToast hook (custom)
  const [formAction, setFormAction] = useState<'create' | 'update'>('create');
  const {
    data: account,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
    isRefetchError,
    refetch,
  } = useAccount(Number(accountId));
  const deleteMutation = useDeleteAccount();
  const { data: linkedInvestments = [] } = useInvestments({
    where: {
      field: 'accountId',
      operator: '=',
      value: Number(accountId),
    },
  });
  const { overallValue: totalInvestmentValue } =
    useInvestmentSummary(linkedInvestments);

  // Formik setup
  const { accountFormik: formik } = useAccountFormik(
    formAction,
    Number(accountId),
  );

  useEffect(() => {
    if (account) {
      formik.setValues({
        name: account.name,
        type: account.type,
        balance:
          account.type === AccountType.INVESTMENT
            ? totalInvestmentValue.toString()
            : account.balance.toString(),
        currency: account.currency,
        earnReturns: account.earnReturns,
      });
    }

    // Set the title for the screen
    const isNewAccount = accountId === 'new';
    navigation.setOptions({
      title: isNewAccount ? 'Create New Account' : 'Edit Account',
    });

    // Show toast if account is not found
    if (!isNewAccount && isSuccess && !account) {
      showToast({ action: 'info', messages: 'Account not found' });
      router.back();
    }
  }, [account, accountId]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='account'
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
          {/* Account Form */}
          <AccountForm
            formik={formik}
            linkedInvestments={linkedInvestments}
          />

          {/* Button Group */}
          {account ? (
            <HStack className='mt-4 justify-between'>
              <Button
                size='lg'
                onPress={() => deleteMutation.mutate(Number(account.id))}
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

export default AccountManager;
