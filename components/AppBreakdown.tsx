import { Text, TouchableNativeFeedback, View } from 'react-native';

import { Box } from './ui/box';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

import styles from '@/app/styles';

export interface BreakdownDisplayOptions {
  colorBoxVisible?: boolean;
  percentageVisible?: boolean;
}

interface BreakdownProps<T> {
  data: T[];

  getLabel: (item: T) => string;
  getValue: (item: T) => number;
  getColor?: (item: T) => string;
  getPercentage?: (item: T) => number | undefined;

  onItemPress?: (item: T) => void;

  displayOptions?: BreakdownDisplayOptions;
  showZeroValues?: boolean;
}

const AppBreakdown = <T extends unknown>({
  data,
  getLabel,
  getValue,
  getColor,
  getPercentage,
  onItemPress,
  displayOptions: { colorBoxVisible = false, percentageVisible = false } = {},
  showZeroValues = false,
}: BreakdownProps<T>) => {
  return (
    <VStack className='my-2'>
      {data.map((item, index) => {
        const value = getValue(item);

        if (value === 0 && !showZeroValues) return null;

        return (
          <HStack
            key={index}
            className='justify-between items-center mx-5 my-2'
          >
            {colorBoxVisible && getColor && (
              <Box
                className='w-5 h-5 rounded'
                style={{
                  backgroundColor: getColor(item),
                }}
              />
            )}

            <TouchableNativeFeedback onPress={() => onItemPress?.(item)}>
              <View
                style={[
                  styles.centered,
                  {
                    width: '40%',
                    padding: 5,
                    borderRadius: 10,
                    backgroundColor: getColor?.(item),
                  },
                ]}
              >
                <Text style={styles.text}>{getLabel(item)}</Text>
              </View>
            </TouchableNativeFeedback>

            <Text style={styles.text}>RM</Text>

            <View
              style={{
                width: '30%',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
              <Text style={styles.text}>{value.toFixed(2)}</Text>

              {percentageVisible && getPercentage && (
                <Text>({getPercentage(item)?.toFixed(1)}%)</Text>
              )}
            </View>
          </HStack>
        );
      })}
    </VStack>
  );
};

export default AppBreakdown;
