import AppBreakdown, { BreakdownDisplayOptions } from './AppBreakdown';

export interface AccountBreakdownItem {
  id: number;
  name: string;
  balance: number;
  percentage?: number;
}

interface AccountBreakdownProps {
  data: AccountBreakdownItem[];
  onItemPress?: (item: AccountBreakdownItem) => void;
  displayOptions?: BreakdownDisplayOptions;
}

const AccountBreakdown = ({
  data,
  onItemPress,
  displayOptions,
}: AccountBreakdownProps) => {
  return (
    <AppBreakdown<AccountBreakdownItem>
      data={data}
      getLabel={(item) => item.name}
      getValue={(item) => item.balance}
      getPercentage={(item) => item.percentage}
      getColor={() => '#ccc'}
      onItemPress={onItemPress}
      displayOptions={displayOptions}
      showZeroValues={true}
    />
  );
};

export default AccountBreakdown;
