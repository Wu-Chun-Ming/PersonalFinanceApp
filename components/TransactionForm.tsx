import { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { FormikProps } from 'formik';

// Gluestack UI
import { HStack } from './ui/hstack';
import { Input, InputField } from './ui/input';
import { SelectItem } from './ui/select';
import { Textarea, TextareaInput } from './ui/textarea';

// Custom import
import {
  RECURRING_FREQUENCIES,
  TRANSACTION_TYPES,
} from '@/constants/transaction';
import { useCommonDescriptions } from '@/hooks/useTransactions';
import { TransactionFormikProps } from '@/hooks/useTransactionsFormik';
import {
  AccountProps,
  RecurringDay,
  RecurringFrequency,
  TransactionTypeValue,
} from '@/types';
import { getCategoriesByTransactionType } from '@/utils/category';
import { rankDescriptionSuggestions } from '@/utils/descriptionAutocomplete';
import AmountInput from './AmountInput';
import DatePicker from './DatePicker';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';

interface TransactionFormProps {
  formik: FormikProps<TransactionFormikProps>;
  accounts: AccountProps[];
  primaryAccount: AccountProps | null;
  transactionType: TransactionTypeValue;
  isExistingTransaction: boolean;
  onTransactionTypeChange?: (type: TransactionTypeValue) => void;
  onDescriptionLayout?: (y: number) => void;
  onDescriptionFocus?: () => void;
  onDescriptionBlur?: () => void;
  onSuggestionsLayout?: (height: number) => void;
}

const TransactionForm = ({
  formik,
  accounts,
  primaryAccount,
  transactionType,
  isExistingTransaction,
  onTransactionTypeChange,
  onDescriptionLayout,
  onDescriptionFocus,
  onDescriptionBlur,
  onSuggestionsLayout,
}: TransactionFormProps) => {
  const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const { data: commonDescriptions = [] } = useCommonDescriptions(
    transactionType,
    50,
  );
  const descriptionSuggestions = useMemo(() => {
    const desc = (formik.values.description || '').trim();
    return rankDescriptionSuggestions(commonDescriptions, desc, 5);
  }, [formik.values.description, commonDescriptions]);

  const changeTransactionType = (transactionType: TransactionTypeValue) => {
    onTransactionTypeChange?.(transactionType); // notify parent
  };

  return (
    <>
      {/* Account */}
      <FormGroup
        label='Account'
        isInvalid={Boolean(formik.errors.accountId && formik.touched.accountId)}
        isRequired={true}
        errorText={formik.errors.accountId}
      >
        <SelectGroup
          initialLabel={
            primaryAccount
              ? `${primaryAccount.type} - ${primaryAccount.name} (${primaryAccount.balance} ${primaryAccount.currency})`
              : ''
          }
          selectedValue={formik.values.accountId}
          onValueChange={formik.handleChange('accountId')}
          placeholder='Select Account'
        >
          {accounts.map((account) => (
            <SelectItem
              key={account.id}
              label={`${account.type} - ${account.name} (${account.balance} ${account.currency})`}
              value={account.id!.toString()}
            />
          ))}
        </SelectGroup>
      </FormGroup>

      {/* Date */}
      {!formik.values.recurring ? (
        <FormGroup
          label='Date'
          isInvalid={Boolean(formik.errors.date && formik.touched.date)}
          isRequired={true}
          errorText={
            Array.isArray(formik.errors.date)
              ? formik.errors.date.join(', ')
              : formik.errors.date
          }
        >
          <Input
            className='text-center'
            isReadOnly={true}
          >
            <TouchableOpacity onPress={() => setDateModalVisible(true)}>
              <InputField
                type='text'
                value={
                  formik.values.date
                    .slice(0, 2)
                    .map((d) => dayjs(d).format('YYYY-MM-DD'))
                    .join(', ') +
                  (formik.values.date?.length > 2
                    ? ` (+ ${formik.values.date.length - 2} more)`
                    : '')
                }
                placeholder='YYYY-MM-DD'
                inputMode='text'
              />
            </TouchableOpacity>
          </Input>
        </FormGroup>
      ) : (
        // Recurring Frequency
        <>
          <FormGroup
            label='Recurring Frequency'
            isInvalid={Boolean(
              (formik.errors.recurring_frequency?.frequency &&
                formik.touched.recurring_frequency?.frequency) ||
              ((typeof formik.errors.recurring_frequency?.time === 'string'
                ? formik.errors.recurring_frequency?.time
                : undefined) &&
                formik.touched.recurring_frequency?.time),
            )}
            isRequired={true}
            errorText={
              formik.errors.recurring_frequency?.frequency ||
              (typeof formik.errors.recurring_frequency?.time === 'string'
                ? formik.errors.recurring_frequency?.time
                : undefined)
            }
          >
            <SelectGroup
              initialLabel={
                formik.values.recurring_frequency.frequency
                  ? formik.values.recurring_frequency.frequency[0].toUpperCase() +
                    formik.values.recurring_frequency.frequency.slice(1)
                  : ''
              }
              selectedValue={formik.values.recurring_frequency.frequency}
              onValueChange={formik.handleChange(
                'recurring_frequency.frequency',
              )}
              placeholder='Select frequency'
            >
              {RECURRING_FREQUENCIES.map((label) => (
                <SelectItem
                  key={label}
                  label={label[0].toUpperCase() + label.slice(1)}
                  value={label}
                />
              ))}
            </SelectGroup>
          </FormGroup>

          <HStack>
            {/* Recurring Day/Month */}
            <FormGroup
              isInvalid={Boolean(
                formik.values.recurring_frequency.frequency ===
                  RecurringFrequency.YEARLY
                  ? formik.errors.recurring_frequency?.time?.month &&
                      formik.touched.recurring_frequency?.time?.month
                  : formik.errors.recurring_frequency?.time?.day &&
                      formik.touched.recurring_frequency?.time?.day,
              )}
              errorText={
                formik.values.recurring_frequency.frequency ===
                RecurringFrequency.YEARLY
                  ? formik.errors.recurring_frequency?.time?.month
                  : formik.errors.recurring_frequency?.time?.day
              }
              style={{
                width: '50%',
              }}
            >
              <SelectGroup
                initialLabel={
                  ((formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.MONTHLY ||
                    formik.values.recurring_frequency.frequency ===
                      RecurringFrequency.WEEKLY) &&
                    (formik.values.recurring_frequency.time.day
                      ? formik.values.recurring_frequency.time.day[0].toUpperCase() +
                        formik.values.recurring_frequency.time.day.slice(1)
                      : '')) ||
                  (formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.YEARLY &&
                    (formik.values.recurring_frequency.time.month
                      ? formik.values.recurring_frequency.time.month[0].toUpperCase() +
                        formik.values.recurring_frequency.time.month.slice(1)
                      : ''))
                }
                selectedValue={formik.values.recurring_frequency.time.day}
                onValueChange={
                  formik.values.recurring_frequency.frequency ===
                  RecurringFrequency.YEARLY
                    ? formik.handleChange('recurring_frequency.time.month')
                    : formik.handleChange('recurring_frequency.time.day')
                }
                isDisabled={
                  formik.values.recurring_frequency.frequency === '' ||
                  formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.DAILY
                }
                placeholder={
                  'Select ' +
                  (formik.values.recurring_frequency.frequency ===
                  RecurringFrequency.YEARLY
                    ? 'month'
                    : 'day')
                }
              >
                {(
                  ((formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.MONTHLY ||
                    formik.values.recurring_frequency.frequency ===
                      RecurringFrequency.WEEKLY) && [
                    ['Monday', RecurringDay.MONDAY],
                    ['Tuesday', RecurringDay.TUESDAY],
                    ['Wednesday', RecurringDay.WEDNESDAY],
                    ['Thursday', RecurringDay.THURSDAY],
                    ['Friday', RecurringDay.FRIDAY],
                    ['Saturday', RecurringDay.SATURDAY],
                    ['Sunday', RecurringDay.SUNDAY],
                  ]) ||
                  (formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.YEARLY && [
                    ['January', 1],
                    ['February', 2],
                    ['March', 3],
                    ['April', 4],
                    ['May', 5],
                    ['June', 6],
                    ['July', 7],
                    ['August', 8],
                    ['September', 9],
                    ['October', 10],
                    ['November', 11],
                    ['December', 12],
                  ]) ||
                  []
                ).map((label) => (
                  <SelectItem
                    key={label[1]}
                    label={label[0].toString()}
                    value={label[1].toString()}
                  />
                ))}
              </SelectGroup>
            </FormGroup>

            {/* Recurring Date */}
            <FormGroup
              isInvalid={Boolean(
                formik.errors.recurring_frequency?.time?.date &&
                formik.touched.recurring_frequency?.time?.date,
              )}
              errorText={formik.errors.recurring_frequency?.time?.date}
              style={{
                width: '50%',
              }}
            >
              <SelectGroup
                initialLabel={
                  formik.values.recurring_frequency.time.date
                    ? `${formik.values.recurring_frequency.time.date}${
                        [, 'st', 'nd', 'rd'][
                          Number(formik.values.recurring_frequency.time.date) %
                            10
                        ] &&
                        ![11, 12, 13].includes(
                          Number(formik.values.recurring_frequency.time.date),
                        )
                          ? [, 'st', 'nd', 'rd'][
                              Number(
                                formik.values.recurring_frequency.time.date,
                              ) % 10
                            ]
                          : 'th'
                      }`
                    : ''
                }
                selectedValue={formik.values.recurring_frequency.time.date}
                onValueChange={formik.handleChange(
                  'recurring_frequency.time.date',
                )}
                isDisabled={
                  formik.values.recurring_frequency.frequency === '' ||
                  formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.DAILY ||
                  formik.values.recurring_frequency.frequency ===
                    RecurringFrequency.WEEKLY
                }
                placeholder='Select date'
                scrollViewStyle={{ maxHeight: 200, overflow: 'scroll' }}
              >
                {Array.from({ length: 31 }, (_, i) => [
                  `${i + 1}${['st', 'nd', 'rd'][((i + 1) % 10) - 1] && ![11, 12, 13].includes(i + 1) ? ['st', 'nd', 'rd'][((i + 1) % 10) - 1] : 'th'}`,
                  i + 1,
                ]).map((label) => (
                  <SelectItem
                    key={label[1]}
                    label={label[0].toString()}
                    value={label[1].toString()}
                  />
                ))}
              </SelectGroup>
            </FormGroup>
          </HStack>
        </>
      )}

      {/* Type */}
      {isExistingTransaction && (
        <FormGroup
          label='Type'
          isInvalid={Boolean(formik.errors.type && formik.touched.type)}
          isRequired={true}
          errorText={formik.errors.type}
        >
          <SelectGroup
            initialLabel={
              formik.values.type[0].toUpperCase() + formik.values.type.slice(1)
            }
            selectedValue={formik.values.type}
            onValueChange={(value: TransactionTypeValue) => {
              changeTransactionType(value);
              formik.setFieldValue('type', value);
            }}
          >
            {TRANSACTION_TYPES.map((label) => (
              <SelectItem
                key={label}
                label={label[0].toUpperCase() + label.slice(1)}
                value={label}
              />
            ))}
          </SelectGroup>
        </FormGroup>
      )}

      {/* Category */}
      <FormGroup
        label='Category'
        isInvalid={Boolean(formik.errors.category && formik.touched.category)}
        isRequired={true}
        errorText={formik.errors.category}
      >
        <SelectGroup
          initialLabel={
            formik.values.category
              ? formik.values.category[0].toUpperCase() +
                formik.values.category.slice(1)
              : ''
          }
          selectedValue={formik.values.category}
          onValueChange={formik.handleChange('category')}
        >
          {getCategoriesByTransactionType(transactionType).map((label) => (
            <SelectItem
              key={label}
              label={label[0].toUpperCase() + label.slice(1)}
              value={label}
            />
          ))}
        </SelectGroup>
      </FormGroup>

      {/* Amount */}
      <FormGroup
        label='Amount (RM)'
        isInvalid={Boolean(formik.errors.amount && formik.touched.amount)}
        isRequired={true}
        errorText={formik.errors.amount}
      >
        <AmountInput
          value={formik.values.amount}
          onChangeText={formik.handleChange('amount')}
          showCalculator={true}
        />
      </FormGroup>

      {/* Description */}
      <View
        onLayout={(event) => {
          onDescriptionLayout?.(event.nativeEvent.layout.y);
        }}
      >
        <FormGroup
          label='Description'
          isInvalid={Boolean(
            formik.errors.description && formik.touched.description,
          )}
          isRequired={true}
          errorText={formik.errors.description}
        >
          <Textarea>
            <TextareaInput
              value={formik.values.description}
              placeholder='Enter Description'
              onChangeText={formik.handleChange('description')}
              onFocus={() => {
                setIsDescriptionFocused(true);
                onDescriptionFocus?.();
              }}
              onBlur={() => {
                setIsDescriptionFocused(false);
                onDescriptionBlur?.();
              }}
              style={{ textAlignVertical: 'top' }}
              inputMode='text'
            />
          </Textarea>

          {/* Description Suggestions */}
          {isDescriptionFocused && descriptionSuggestions.length > 0 && (
            <View
              onLayout={(event) => {
                onSuggestionsLayout?.(event.nativeEvent.layout.height);
              }}
              style={{
                marginTop: 8,
                padding: 6,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: '#e5e7eb',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {descriptionSuggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion}
                    onPress={() =>
                      formik.setFieldValue('description', suggestion)
                    }
                    style={{
                      margin: 6,
                      padding: 8,
                      backgroundColor: '#f3f4f6',
                      borderRadius: 16,
                    }}
                  >
                    <Text>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </FormGroup>
      </View>

      {/* Date Picker */}
      <DatePicker
        visible={dateModalVisible}
        fieldName='date'
        formik={formik}
        onClose={() => setDateModalVisible(false)}
      />
    </>
  );
};

export default TransactionForm;
