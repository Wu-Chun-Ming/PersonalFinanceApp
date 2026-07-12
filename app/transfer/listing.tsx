import { SafeAreaView } from 'react-native-safe-area-context';

// Custom import
import QueryState from '@/components/QueryState';
import TransferListing from '@/components/TransferListing';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransfers } from '@/hooks/useTransfers';

const TransferListScreen = () => {
  // Transfers Data
  const {
    data: transfers = [],
    isLoading,
    isError,
    isRefetchError,
    isRefetching,
    refetch,
  } = useTransfers();
  const { data: accounts = [] } = useAccounts();

  const queryState = (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      isRefetching={isRefetching}
      isRefetchError={isRefetchError}
      queryKey='transfers'
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
      {/* Transfer Listing */}
      <TransferListing
        data={transfers}
        accounts={accounts}
      />
    </SafeAreaView>
  );
};

export default TransferListScreen;
