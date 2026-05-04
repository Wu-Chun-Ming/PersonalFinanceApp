import { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { HStack } from './ui/hstack';

import { getMonthName } from '@/utils/time';

interface MonthSelectorProps {
  onMonthChange: (month: number) => void;
}

const MonthSelector = ({ onMonthChange }: MonthSelectorProps) => {
  const now = new Date();
  const [selectedLocalMonth, setSelectedLocalMonth] = useState(
    now.getMonth() + 1,
  ); // 1-12 range

  const changeMonth = (month: number) => {
    setSelectedLocalMonth(month);
    onMonthChange?.(month); // notify parent
  };

  return (
    <HStack className='justify-between items-center m-2'>
      <TouchableOpacity
        disabled={selectedLocalMonth <= 1}
        onPress={() => changeMonth(selectedLocalMonth - 1)}
      >
        <AntDesign
          name='left-circle'
          size={24}
          color={selectedLocalMonth <= 1 ? 'gray' : 'white'}
          style={{ paddingHorizontal: 10 }}
        />
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
        {getMonthName(selectedLocalMonth)}
      </Text>

      <TouchableOpacity
        disabled={selectedLocalMonth >= 12}
        onPress={() => changeMonth(selectedLocalMonth + 1)}
      >
        <AntDesign
          name='right-circle'
          size={24}
          color={selectedLocalMonth >= 12 ? 'gray' : 'white'}
          style={{ paddingHorizontal: 10 }}
        />
      </TouchableOpacity>
    </HStack>
  );
};

export default MonthSelector;
