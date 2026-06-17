import { Fragment, useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { router } from 'expo-router';
import dayjs from 'dayjs';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { AddIcon } from '@/components/ui/icon';

// Custom import
import styles from '@/app/styles';
import ActionFab from '@/components/ActionFab';
import InvestmentBreakdown, {
  InvestmentBreakdownItem,
} from '@/components/InvestmentBreakdown';
import QueryState from '@/components/QueryState';
import { INVESTMENT_TYPE_COLORS } from '@/constants/colors';
import { INVESTMENT_TYPES } from '@/constants/investment';
import {
  useInvestmentData,
  useInvestments,
  useInvestmentSummary,
  usePieChartInvestments,
} from '@/hooks/useInvestments';
import { InvestmentTypeValue } from '@/types';

const InvestmentsScreen = () => {
  const {
    data: investments = [],
    isLoading,
    isError,
    isSuccess,
    isRefetchError,
    isRefetching,
    refetch,
  } = useInvestments();
  const insets = useSafeAreaInsets();
  const shouldRenderPieChart = investments && investments.length > 0;
  const { investmentsByType, lastUpdatedDate } = useInvestmentData(investments);
  const { totalValuePerInvestmentType, percentagesPerType, overallValue } =
    useInvestmentSummary(investments);
  const { investmentPerType } = usePieChartInvestments(investments);

  const investmentByTypeWithPercentages = useMemo(() => {
    const result = {} as Record<InvestmentTypeValue, InvestmentBreakdownItem[]>;

    for (const type of INVESTMENT_TYPES) {
      const totalValue = totalValuePerInvestmentType[type] ?? 0;

      result[type] = investmentsByType[type].map(({ id, name, value }) => ({
        id: id!,
        name,
        value,
        percentage: (value / totalValue) * 100, // Calculate percentage for each investment based on total value of the type
      }));
    }

    return result;
  }, [investmentsByType, totalValuePerInvestmentType]);

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='investments'
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
        <Text style={styles.boldText}>
          Total Value: RM{' '}
          {overallValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          {'\n'}
          (Last Updated:{' '}
          {lastUpdatedDate
            ? dayjs(lastUpdatedDate).format('DD MMM YYYY, h:mm A')
            : 'N/A'}
          )
        </Text>
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
          <PieChart data={investmentPerType} />
        ) : (
          <View style={styles.centeredFlex}>
            <Text style={styles.boldText}>No data available.</Text>
          </View>
        )}
      </View>

      {shouldRenderPieChart && (
        <ScrollView>
          {/* Value by Type */}
          {INVESTMENT_TYPES.map(
            (type) =>
              investmentByTypeWithPercentages[type].length > 0 && (
                <Fragment key={type}>
                  <View
                    style={{
                      paddingHorizontal: 15,
                      paddingVertical: 10,
                      backgroundColor: INVESTMENT_TYPE_COLORS[type],
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
                            backgroundColor: INVESTMENT_TYPE_COLORS[type],
                            padding: 8,
                            borderRadius: 10,
                          },
                        ]}
                      >
                        RM{' '}
                        {totalValuePerInvestmentType[type].toLocaleString(
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

                  {/* Investment Breakdown */}
                  <InvestmentBreakdown
                    data={investmentByTypeWithPercentages[type]}
                    onItemPress={(item) =>
                      router.push(`/investment/${item.id}`)
                    }
                    displayOptions={{
                      percentageVisible: true,
                    }}
                  />
                </Fragment>
              ),
          )}

          {/* Reserve Space for Floating Action Button */}
          <View style={{ minHeight: 60 }} />
        </ScrollView>
      )}

      {/* Floating action button to add new investment */}
      <ActionFab
        href={`/investment/new`}
        icon={AddIcon}
        style={{
          marginBottom: insets.bottom,
        }}
      />
    </SafeAreaView>
  );
};

export default InvestmentsScreen;
