import { Text } from 'react-native';
import { FormikProps } from 'formik';

import { HStack } from './ui/hstack';
import { SelectItem } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea, TextareaInput } from './ui/textarea';

import { ACCOUNT_TYPES } from '@/constants/account';
import { CURRENCIES } from '@/constants/currency';
import { AccountFormikProps } from '@/hooks/useAccountsFormik';
import { AccountType } from '@/types';
import AmountInput from './AmountInput';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';

interface AccountFormProps {
  formik: FormikProps<AccountFormikProps>;
}

const AccountForm = ({ formik }: AccountFormProps) => {
  return (
    <>
      {/* Name */}
      <FormGroup
        label='Name'
        isInvalid={Boolean(formik.errors.name && formik.touched.name)}
        isRequired
        errorText={formik.errors.name}
      >
        <Textarea>
          <TextareaInput
            value={formik.values.name}
            placeholder='Enter Name'
            onChangeText={formik.handleChange('name')}
            style={{ textAlignVertical: 'top' }}
            inputMode='text'
          />
        </Textarea>
      </FormGroup>

      {/* Type */}
      <FormGroup
        label='Type'
        isInvalid={Boolean(formik.errors.type && formik.touched.type)}
        isRequired
        errorText={formik.errors.type}
      >
        <SelectGroup
          selectedValue={formik.values.type}
          onValueChange={(value: string) => {
            formik.setFieldValue('type', value);
            if (
              value === AccountType.BANK ||
              value === AccountType.INVESTMENT
            ) {
              formik.setFieldValue('earnReturns', false);
            }
          }}
        >
          {ACCOUNT_TYPES.map((value) => (
            <SelectItem
              key={value}
              label={value}
              value={value}
            />
          ))}
        </SelectGroup>
      </FormGroup>

      {/* Balance */}
      <FormGroup
        label='Balance'
        isInvalid={Boolean(formik.errors.balance && formik.touched.balance)}
        isRequired
        errorText={formik.errors.balance}
      >
        <AmountInput
          value={formik.values.balance}
          onChangeText={formik.handleChange('balance')}
        />
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

      {/* Earn Returns */}
      <HStack className='my-2 items-center'>
        <Switch
          value={formik.values.earnReturns}
          onToggle={() =>
            formik.setFieldValue('earnReturns', !formik.values.earnReturns)
          }
          isDisabled={
            formik.values.type === AccountType.BANK ||
            formik.values.type === AccountType.INVESTMENT
          }
        />
        <Text>Earn Returns</Text>
      </HStack>
    </>
  );
};

export default AccountForm;
