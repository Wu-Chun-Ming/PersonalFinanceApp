import { Text } from 'react-native';

import { HStack } from './ui/hstack';
import { Switch } from './ui/switch';

const AppSwitch = ({
  value,
  onToggle,
  label,
}: {
  value: boolean;
  onToggle: () => void;
  label: string;
}) => {
  return (
    <HStack className='my-2 items-center'>
      <Switch
        value={value}
        onToggle={onToggle}
      />
      <Text>{label}</Text>
    </HStack>
  );
};

export default AppSwitch;
