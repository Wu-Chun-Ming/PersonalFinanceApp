import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HStack } from './ui/hstack';
import { Input, InputField } from './ui/input';

// Custom import
import styles from '@/app/styles';
import CalculatorModal from './CalculatorModal';

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  inputMode?: 'numeric' | 'text';
  showCalculator?: boolean;
}

const AmountInput = ({
  value,
  onChangeText,
  placeholder = 'Enter Amount',
  inputMode = 'numeric',
  showCalculator = false,
}: AmountInputProps) => {
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  return (
    <>
      <HStack style={{ alignItems: 'center', gap: 12 }}>
        <Input className='flex-1 text-center'>
          <InputField
            type='text'
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            inputMode={inputMode}
          />
        </Input>

        {showCalculator && (
          <TouchableOpacity
            accessibilityRole='button'
            accessibilityLabel='Open calculator'
            onPress={() => setCalculatorOpen(true)}
            style={[
              styles.centered,
              {
                width: 40,
                height: 40,
                borderWidth: 1,
                borderRadius: 12,
                borderColor: '#d4d4d8',
              },
            ]}
          >
            <Ionicons
              name='calculator-outline'
              size={22}
            />
          </TouchableOpacity>
        )}
      </HStack>

      <CalculatorModal
        isOpen={calculatorOpen}
        amount={value}
        onClose={() => setCalculatorOpen(false)}
        onAmountChange={(amount) => onChangeText(amount)}
      />
    </>
  );
};

export default AmountInput;
