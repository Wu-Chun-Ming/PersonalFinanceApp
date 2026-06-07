import { TRANSACTION_CATEGORY_COLORS } from '@/constants/colors';
import AppBreakdown, { BreakdownDisplayOptions } from './AppBreakdown';

interface TransactionBreakdownItem {
  category: keyof typeof TRANSACTION_CATEGORY_COLORS;
  total: number;
  percentage?: number;
}

interface TransactionBreakdownProps {
  data: TransactionBreakdownItem[];
  onItemPress?: (item: TransactionBreakdownItem) => void;
  displayOptions?: BreakdownDisplayOptions;
}

const TransactionBreakdown = ({
  data,
  onItemPress,
  displayOptions,
}: TransactionBreakdownProps) => {
  return (
    <AppBreakdown<TransactionBreakdownItem>
      data={data}
      getLabel={(item) => item.category}
      getValue={(item) => item.total}
      getPercentage={(item) => item.percentage}
      getColor={(item) => TRANSACTION_CATEGORY_COLORS[item.category]}
      onItemPress={onItemPress}
      displayOptions={displayOptions}
    />
  );
};

export default TransactionBreakdown;
