import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom import
import Breakdown from '@/app/transaction/breakdown';
import Overview from '@/app/transaction/overview';
import SegmentedControl from '@/components/SegmentedControl';

const TransactionScreen = () => {
  const [tab, setTab] = useState<'overview' | 'breakdown'>('overview');

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['bottom']}
    >
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Overview', value: 'overview' },
          { label: 'Breakdown', value: 'breakdown' },
        ]}
      />

      {tab === 'overview' ? <Overview /> : <Breakdown />}
    </SafeAreaView>
  );
};

export default TransactionScreen;
