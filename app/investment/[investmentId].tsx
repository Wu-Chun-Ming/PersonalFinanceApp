import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';

// Gluestack UI
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import InvestmentForm from '@/components/InvestmentForm';
import QueryState from '@/components/QueryState';
import { useAccountData, useAccounts } from '@/hooks/useAccounts';
import { useDeleteInvestment, useInvestment } from '@/hooks/useInvestments';
import { useInvestmentFormik } from '@/hooks/useInvestmentsFormik';
import useShowToast from '@/hooks/useShowToast';

const InvestmentManager = () => {
  const { investmentId } = useLocalSearchParams();
  const navigation = useNavigation();
  const showToast = useShowToast(); // Use the useShowToast hook (custom)
  const [formAction, setFormAction] = useState<'create' | 'update'>('create');
  const {
    data: investment,
    isLoading,
    isError,
    isSuccess,
    isRefetching,
    isRefetchError,
    refetch,
  } = useInvestment(Number(investmentId));
  const deleteMutation = useDeleteInvestment();
  const { data: accounts = [] } = useAccounts();
  const { accountsByType } = useAccountData(accounts);
  const investmentAccounts = accountsByType.Investment;
  const earnedReturnsAccounts = [
    ...accountsByType.Cash,
    ...accountsByType['e-Wallet'],
  ];
  const accountInfo = [...investmentAccounts, ...earnedReturnsAccounts].find(
    (acc) => acc.id === investment?.accountId,
  );

  // Formik setup
  const { investmentFormik: formik } = useInvestmentFormik(
    formAction,
    Number(investmentId),
  );

  useEffect(() => {
    if (investment) {
      formik.setValues({
        accountId: investment.accountId.toString(),
        name: investment.name,
        type: investment.type,
        value: investment.value.toString(),
        currency: investment.currency,
      });
    }

    // Set the title for the screen
    const isNewInvestment = investmentId === 'new';
    navigation.setOptions({
      title: isNewInvestment ? 'Create New Investment' : 'Edit Investment',
    });

    // Show toast if investment is not found
    if (!isNewInvestment && isSuccess && !investment) {
      showToast({ action: 'info', messages: 'Investment not found' });
      router.back();
    }
  }, [investment, investmentId]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='investment'
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
          {/* Investment Form */}
          <InvestmentForm
            formik={formik}
            accounts={investmentAccounts}
            accountInfo={accountInfo}
          />

          {/* Button Group */}
          {investment ? (
            <HStack className='mt-4 justify-between'>
              <Button
                size='lg'
                onPress={() => deleteMutation.mutate(Number(investment.id))}
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

export default InvestmentManager;
