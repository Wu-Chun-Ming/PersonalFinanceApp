import { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Button, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from './ui/modal';

import {
  applyCalculatorKey,
  evaluateCalculatorExpression,
} from '@/utils/calculator';

type CalculatorModalProps = {
  isOpen: boolean;
  amount: string;
  onClose: () => void;
  onAmountChange: (amount: string) => void;
};

type CalculatorKey =
  | 'C'
  | '⌫'
  | '%'
  | '÷'
  | 'x'
  | '-'
  | '+'
  | '.'
  | '='
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9';

const KEY_ROWS: CalculatorKey[][] = [
  ['C', '⌫', '%', '÷'],
  ['7', '8', '9', 'x'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
];

const operatorKeys = new Set<CalculatorKey>(['÷', 'x', '-', '+']);

const keyLabelMap: Record<CalculatorKey, string> = {
  C: 'Clear',
  '⌫': 'Backspace',
  '%': 'Percent',
  '÷': 'Divide',
  x: 'Multiply',
  '-': 'Subtract',
  '+': 'Add',
  '.': 'Decimal point',
  '=': 'Equals',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
};

const CalculatorModal = ({
  isOpen,
  amount,
  onClose,
  onAmountChange,
}: CalculatorModalProps) => {
  const [expression, setExpression] = useState<string>('0');

  useEffect(() => {
    if (isOpen) {
      setExpression(amount?.trim() ? amount : '0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const result = useMemo(
    () => evaluateCalculatorExpression(expression),
    [expression],
  );

  const handleKeyPress = (key: CalculatorKey) => {
    setExpression((currentExpression) => {
      const nextExpression = applyCalculatorKey(currentExpression, key);

      if (key === '=') {
        onAmountChange(nextExpression);
        return nextExpression;
      }

      const nextValue = evaluateCalculatorExpression(nextExpression);
      onAmountChange(nextValue);
      return nextExpression;
    });
  };

  const renderButton = (key: CalculatorKey) => {
    const isOperator = operatorKeys.has(key);
    const isActionKey = key === 'C' || key === '⌫';
    const isEqualsKey = key === '=';

    return (
      <TouchableOpacity
        key={key}
        accessibilityRole='button'
        accessibilityLabel={keyLabelMap[key]}
        onPress={() => handleKeyPress(key)}
        style={[
          localStyles.keyButton,
          isActionKey && localStyles.actionKeyButton,
          isOperator && localStyles.operatorKeyButton,
          isEqualsKey && localStyles.equalsKeyButton,
          key === '0' && localStyles.zeroKeyButton,
        ]}
      >
        {key === '⌫' ? (
          <Ionicons
            name='backspace-outline'
            size={18}
            color={isOperator || isEqualsKey ? '#ffffff' : '#3f3f46'}
          />
        ) : (
          <Text
            style={[
              localStyles.keyLabel,
              (isOperator || isEqualsKey) && localStyles.lightKeyLabel,
            ]}
          >
            {key}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='lg'
    >
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading>Calculator</Heading>

          <Button
            variant='link'
            action='secondary'
            onPress={onClose}
          >
            <ButtonText>Close</ButtonText>
          </Button>
        </ModalHeader>

        <ModalBody>
          <View style={localStyles.displayPanel}>
            <Text style={localStyles.expressionLabel}>Expression</Text>
            <Text
              numberOfLines={2}
              style={localStyles.expressionText}
            >
              {expression}
            </Text>
            <Text style={localStyles.resultLabel}>Result</Text>
            <Text style={localStyles.resultText}>{result}</Text>
          </View>

          <View style={localStyles.keypad}>
            {KEY_ROWS.map((row, rowIndex) => (
              <View
                key={`row-${rowIndex}`}
                style={localStyles.keyRow}
              >
                {row.map((key) => renderButton(key))}
              </View>
            ))}
          </View>
        </ModalBody>

        <ModalFooter>
          <Button onPress={onClose}>
            <ButtonText>Done</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const localStyles = {
  displayPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  expressionLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  expressionText: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 4,
    minHeight: 28,
  },
  resultLabel: {
    color: '#71717a',
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.6,
    marginTop: 10,
    textTransform: 'uppercase' as const,
  },
  resultText: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  keypad: {
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row' as const,
    gap: 10,
  },
  keyButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#f4f4f5',
  },
  zeroKeyButton: {
    flex: 2,
  },
  actionKeyButton: {
    backgroundColor: '#e4e4e7',
  },
  operatorKeyButton: {
    backgroundColor: '#f59e0b',
  },
  equalsKeyButton: {
    backgroundColor: '#0f766e',
  },
  keyLabel: {
    color: '#18181b',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  lightKeyLabel: {
    color: '#ffffff',
  },
};

export default CalculatorModal;
