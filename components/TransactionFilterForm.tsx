import { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import dayjs from 'dayjs';
import { FormikProps } from 'formik';

// Gluestack UI
import { Button } from './ui/button';
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

// Custom import
import styles from '@/app/styles';
import {
  RECURRING_FREQUENCIES,
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from '@/constants/transaction';
import AppDropdown from './AppDropdown';
import DatePicker from './DatePicker';

interface FilterValues {
  date: string[];
  type: string;
  category: string;
  amount: string;
  recurring: string;
  frequency: string;
}

interface TransactionFilterFormProps {
  isCollapsed: boolean;
  formik: FormikProps<FilterValues>;
}

const TransactionFilterForm = ({
  isCollapsed,
  formik,
}: TransactionFilterFormProps) => {
  const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);

  const dates = formik.values.date || [];
  const hasDates = dates.length > 0;

  const startDate = hasDates ? dayjs(dates[0]).format('YYYY-MM-DD') : null;
  const endDate =
    dates.length > 1
      ? dayjs(dates[dates.length - 1]).format('YYYY-MM-DD')
      : null;

  return (
    <>
      <Collapsible collapsed={isCollapsed}>
        <VStack
          style={{
            backgroundColor: '#fff',
          }}
        >
          {/* Date */}
          <HStack
            style={[
              {
                margin: 5,
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#d8e0e6ff',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.boldText,
                {
                  marginRight: 10,
                },
              ]}
            >
              Date:
            </Text>
            <TouchableOpacity
              onPress={() => setDateModalVisible(true)}
              style={{
                flex: 1,
              }}
            >
              {hasDates ? (
                <HStack style={{ justifyContent: 'space-evenly' }}>
                  <Text style={styles.text}>{startDate}</Text>
                  {endDate && <Text style={styles.text}> to </Text>}
                  {endDate && <Text style={styles.text}>{endDate}</Text>}
                </HStack>
              ) : (
                <Text
                  style={[
                    styles.text,
                    styles.centeredFlex,
                    {
                      textAlign: 'center',
                    },
                  ]}
                >
                  Select date
                </Text>
              )}
            </TouchableOpacity>
          </HStack>

          {/* Type */}
          <HStack
            style={[
              {
                margin: 5,
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#d8e0e6ff',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.boldText,
                {
                  marginRight: 10,
                },
              ]}
            >
              Type:
            </Text>
            <AppDropdown
              data={[
                { label: 'All', value: '' },
                ...TRANSACTION_TYPES.map((type) => ({
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  value: type,
                })),
              ]}
              placeholder='...'
              placeholderStyle={{
                textAlign: 'center',
              }}
              value={formik.values.type.toString()}
              onChange={(value) => formik.setFieldValue('type', value)}
              style={{
                flex: 1,
              }}
              selectedTextStyle={{
                textAlign: 'center',
              }}
              itemTextStyle={[
                styles.text,
                {
                  textAlign: 'center',
                },
              ]}
            />
          </HStack>

          {/* Category */}
          <HStack
            style={[
              {
                margin: 5,
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#d8e0e6ff',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.boldText,
                {
                  marginRight: 10,
                },
              ]}
            >
              Category:
            </Text>
            <AppDropdown
              data={[
                { label: '-', value: '' },
                ...TRANSACTION_CATEGORIES.map((category) => ({
                  label: category.charAt(0).toUpperCase() + category.slice(1),
                  value: category,
                })),
              ]}
              placeholder='Select category'
              placeholderStyle={{
                textAlign: 'center',
              }}
              value={formik.values.category.toString()}
              onChange={(value) => formik.setFieldValue('category', value)}
              style={[
                {
                  flex: 1,
                },
              ]}
              selectedTextStyle={{
                textAlign: 'center',
              }}
              itemTextStyle={[
                styles.text,
                {
                  textAlign: 'center',
                },
              ]}
            />
          </HStack>

          {/* Amount */}
          <HStack
            style={[
              {
                margin: 5,
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#d8e0e6ff',
                borderRadius: 10,
              },
            ]}
          >
            <Text
              style={[
                styles.boldText,
                {
                  marginRight: 10,
                },
              ]}
            >
              Amount:
            </Text>
            <TextInput
              style={[styles.text, styles.centeredFlex]}
              keyboardType='numeric'
              placeholder='Enter amount'
              value={formik.values.amount.toString()}
              onChangeText={(value) => formik.setFieldValue('amount', value)}
            />
          </HStack>

          {/* Recurring & Frequency */}
          <HStack
            style={{
              margin: 5,
              justifyContent: 'space-between',
            }}
          >
            {/* Recurring */}
            <HStack
              style={[
                {
                  width: '45%',
                  marginRight: 10,
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor: '#d8e0e6ff',
                  borderRadius: 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.boldText,
                  {
                    marginRight: 10,
                  },
                ]}
              >
                Recurring:
              </Text>
              <AppDropdown
                data={[
                  { label: '-', value: '' },
                  { label: 'Yes', value: 'true' },
                  { label: 'No', value: 'false' },
                ]}
                placeholder='-'
                placeholderStyle={{
                  textAlign: 'center',
                }}
                value={formik.values.recurring.toString()}
                onChange={(value) => formik.setFieldValue('recurring', value)}
                style={[
                  {
                    flex: 1,
                  },
                ]}
                selectedTextStyle={{
                  textAlign: 'center',
                }}
                itemTextStyle={[
                  styles.text,
                  {
                    textAlign: 'center',
                  },
                ]}
              />
            </HStack>

            {/* Frequency */}
            <HStack
              style={[
                {
                  flex: 1,
                  alignItems: 'center',
                  padding: 10,
                  backgroundColor: '#d8e0e6ff',
                  borderRadius: 10,
                },
              ]}
            >
              <Text
                style={[
                  styles.boldText,
                  {
                    marginRight: 10,
                  },
                ]}
              >
                Frequency:
              </Text>
              <AppDropdown
                data={[
                  { label: '-', value: '' },
                  ...RECURRING_FREQUENCIES.map((frequency) => ({
                    label:
                      frequency.charAt(0).toUpperCase() + frequency.slice(1),
                    value: frequency,
                  })),
                ]}
                placeholder='-'
                placeholderStyle={{
                  textAlign: 'center',
                }}
                value={formik.values.frequency.toString()}
                onChange={(value) => formik.setFieldValue('frequency', value)}
                style={[
                  {
                    flex: 1,
                  },
                ]}
                selectedTextStyle={{
                  textAlign: 'center',
                }}
                itemTextStyle={[
                  styles.text,
                  {
                    textAlign: 'center',
                  },
                ]}
              />
            </HStack>
          </HStack>
          {/* Reset Filters Button */}
          {formik.values && (
            <Button
              onPress={() => {
                formik.resetForm({
                  values: {
                    date: [],
                    type: '',
                    category: '',
                    amount: '',
                    recurring: '',
                    frequency: '',
                  },
                });
              }}
              style={{
                margin: 5,
                borderRadius: 10,
                backgroundColor: 'red',
              }}
            >
              <Text
                style={[
                  styles.boldText,
                  {
                    color: 'white',
                  },
                ]}
              >
                Reset Filters
              </Text>
            </Button>
          )}
        </VStack>
      </Collapsible>

      {/* Date Picker Modal */}
      <DatePicker
        visible={dateModalVisible}
        fieldName='date'
        formik={formik}
        onClose={() => setDateModalVisible(false)}
      />
    </>
  );
};

export default TransactionFilterForm;
