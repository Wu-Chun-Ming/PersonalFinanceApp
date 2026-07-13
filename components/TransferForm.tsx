import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import dayjs from 'dayjs';
import { FormikProps } from 'formik';

import { Input, InputField } from './ui/input';
import { SelectItem } from './ui/select';
import { Textarea, TextareaInput } from './ui/textarea';

import { CURRENCIES } from '@/constants/currency';
import { TransferFormikProps } from '@/hooks/useTransfersFormik';
import { AccountProps } from '@/types';
import AmountInput from './AmountInput';
import DatePicker from './DatePicker';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';

interface TransferFormProps {
  formik: FormikProps<TransferFormikProps>;
  accounts: AccountProps[];
  primaryAccount: AccountProps | null;
}

const CREATE_ACCOUNT_VALUE = '__create_account__';

const TransferForm = ({
  formik,
  accounts,
  primaryAccount,
}: TransferFormProps) => {
  const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
  const toAccount = accounts.find(
    (account) => account.id === Number(formik.values.toAccountId),
  );

  return (
    <>
      {/* Date */}
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
              value={dayjs(formik.values.date).format('YYYY-MM-DD')}
              placeholder='YYYY-MM-DD'
              inputMode='text'
            />
          </TouchableOpacity>
        </Input>
      </FormGroup>

      {/* Date Picker */}
      <DatePicker
        visible={dateModalVisible}
        fieldName='date'
        formik={formik}
        mode='single'
        onClose={() => setDateModalVisible(false)}
      />

      {/* From Account */}
      <FormGroup
        label='From Account'
        isInvalid={Boolean(
          formik.errors.fromAccountId && formik.touched.fromAccountId,
        )}
        isRequired={true}
        errorText={formik.errors.fromAccountId}
      >
        <SelectGroup
          initialLabel={
            primaryAccount
              ? `${primaryAccount.type} - ${primaryAccount.name} (${primaryAccount.balance} ${primaryAccount.currency})`
              : ''
          }
          selectedValue={formik.values.fromAccountId}
          onValueChange={(value: string) => {
            if (value === CREATE_ACCOUNT_VALUE) {
              router.replace('/account/new');
              return;
            }

            formik.setFieldValue('fromAccountId', value);
          }}
          placeholder='Select Account'
        >
          {accounts.map((account) => (
            <SelectItem
              key={account.id}
              label={`${account.type} - ${account.name} (${account.balance} ${account.currency})`}
              value={account.id!.toString()}
            />
          ))}
          <SelectItem
            label='+ Create New Account'
            value={CREATE_ACCOUNT_VALUE}
          />
        </SelectGroup>
      </FormGroup>

      {/* To Account */}
      <FormGroup
        label='To Account'
        isInvalid={Boolean(
          formik.errors.toAccountId && formik.touched.toAccountId,
        )}
        isRequired={true}
        errorText={formik.errors.toAccountId}
      >
        <SelectGroup
          initialLabel={
            toAccount
              ? `${toAccount.type} - ${toAccount.name} (${toAccount.balance} ${toAccount.currency})`
              : ``
          }
          selectedValue={formik.values.toAccountId}
          onValueChange={(value: string) => {
            if (value === CREATE_ACCOUNT_VALUE) {
              router.replace('/account/new');
              return;
            }

            formik.setFieldValue('toAccountId', value);
          }}
          placeholder='Select Account'
        >
          {accounts.map((account) => (
            <SelectItem
              key={account.id}
              label={`${account.type} - ${account.name} (${account.balance} ${account.currency})`}
              value={account.id!.toString()}
              disabled={account.id!.toString() === formik.values.fromAccountId}
              className={
                account.id!.toString() === formik.values.fromAccountId
                  ? 'opacity-50 text-gray-400'
                  : ''
              }
            />
          ))}
          <SelectItem
            label='+ Create New Account'
            value={CREATE_ACCOUNT_VALUE}
          />
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
            style={{ textAlignVertical: 'top' }}
            inputMode='text'
          />
        </Textarea>
      </FormGroup>

      {/* Currency */}
      <FormGroup
        label='Currency'
        isInvalid={Boolean(formik.errors.currency && formik.touched.currency)}
        isRequired
        errorText={formik.errors.currency}
      >
        <SelectGroup
          selectedValue={formik.values.currency}
          onValueChange={formik.handleChange('currency')}
        >
          {CURRENCIES.map((currency) => (
            <SelectItem
              key={currency}
              label={currency[0].toUpperCase() + currency.slice(1)}
              value={currency}
            />
          ))}
        </SelectGroup>
      </FormGroup>
    </>
  );
};

export default TransferForm;
