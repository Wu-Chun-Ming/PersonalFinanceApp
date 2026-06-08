import { Fragment, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';

// Custom import
import styles from '@/app/styles';
import AccountBreakdown, {
  AccountBreakdownItem,
} from '@/components/AccountBreakdown';
import ActionFab from '@/components/ActionFab';
import QueryState from '@/components/QueryState';
import { ACCOUNT_TYPES } from '@/constants/account';
import { ACCOUNT_TYPE_COLORS } from '@/constants/colors';
import {
  useAccountData,
  useAccounts,
  useAccountSummary,
  usePieChartAccounts,
} from '@/hooks/useAccounts';
import { AccountTypeValue } from '@/types';

const AccountsScreen = () => {
  const {
    data: accounts = [],
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch,
  } = useAccounts();
  const insets = useSafeAreaInsets();
  const shouldRenderPieChart = accounts && accounts.length > 0;
  const { accountsByType } = useAccountData(accounts);
  const { totalBalancePerAccountType, percentagesPerType, overallBalance } =
    useAccountSummary(accounts);
  const { accountPerType } = usePieChartAccounts(accounts);

  const accountByTypeWithPercentages = useMemo(() => {
    const result = {} as Record<AccountTypeValue, AccountBreakdownItem[]>;

    for (const type of ACCOUNT_TYPES) {
      const totalBalance = totalBalancePerAccountType[type] ?? 0;

      result[type] = accountsByType[type].map(({ id, name, balance }) => ({
        id: id!,
        name,
        balance,
        percentage: (balance / totalBalance) * 100, // Calculate percentage for each account based on total balance of the type
      }));
    }

    return result;
  }, [accountsByType, totalBalancePerAccountType]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='accounts'
      onRetry={refetch}
    />
  );

  if (isLoading || isRefetching || isError || isRefetchError) return queryState;

  return (
    <SafeAreaView
      style={{ flex: 1, margin: 10 }}
      edges={['bottom']}
    >
      <View>
        <Heading>
          Total Balance: RM{' '}
          {overallBalance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Heading>
      </View>
      {/* Pie Chart */}
      <View
        style={[
          styles.centered,
          {
            height: '40%',
          },
        ]}
      >
        {shouldRenderPieChart ? (
          <PieChart data={accountPerType} />
        ) : (
          <View style={styles.centeredFlex}>
            <Text style={styles.boldText}>No data available.</Text>
          </View>
        )}
      </View>

      {shouldRenderPieChart && (
        <ScrollView>
          {/* Balance by Type */}
          {ACCOUNT_TYPES.map((type) => (
            <Fragment key={type}>
              <View
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: ACCOUNT_TYPE_COLORS[type],
                  borderRadius: 20,
                }}
              >
                <HStack className='justify-between items-center'>
                  <Heading
                    style={{
                      textDecorationLine: 'underline',
                    }}
                  >
                    {type[0].toUpperCase() + type.slice(1)}
                  </Heading>
                  <Text
                    style={[
                      styles.text,
                      {
                        backgroundColor: ACCOUNT_TYPE_COLORS[type],
                        padding: 8,
                        borderRadius: 10,
                      },
                    ]}
                  >
                    RM{' '}
                    {totalBalancePerAccountType[type].toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}{' '}
                    ({percentagesPerType[type].toFixed(1)}%)
                  </Text>
                </HStack>
              </View>

              {/* Account Breakdown */}
              <AccountBreakdown
                data={accountByTypeWithPercentages[type]}
                onItemPress={(item) => router.push(`/account/${item.id}`)}
                displayOptions={{
                  percentageVisible: true,
                }}
              />
            </Fragment>
          ))}

          {/* Reserve Space for Floating Action Button */}
          <View style={{ minHeight: 60 }} />
        </ScrollView>
      )}

      {/* Floating action button to add new account */}
      <ActionFab
        href={`/account/new`}
        icon={AddIcon}
        style={{
          marginBottom: insets.bottom,
        }}
      />
    </SafeAreaView>
  );
};

export default AccountsScreen;
