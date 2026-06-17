import AppBreakdown, { BreakdownDisplayOptions } from './AppBreakdown';

export interface InvestmentBreakdownItem {
  id: number;
  name: string;
  value: number;
  percentage?: number;
}

interface InvestmentBreakdownProps {
  data: InvestmentBreakdownItem[];
  onItemPress?: (item: InvestmentBreakdownItem) => void;
  displayOptions?: BreakdownDisplayOptions;
}

const InvestmentBreakdown = ({
  data,
  onItemPress,
  displayOptions,
}: InvestmentBreakdownProps) => {
  return (
    <AppBreakdown<InvestmentBreakdownItem>
      data={data}
      getLabel={(item) => item.name}
      getValue={(item) => item.value}
      getPercentage={(item) => item.percentage}
      getColor={() => '#ccc'}
      onItemPress={onItemPress}
      displayOptions={displayOptions}
      showZeroValues={true}
    />
  );
};

export default InvestmentBreakdown;
