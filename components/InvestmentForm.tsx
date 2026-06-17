import { FormikProps } from 'formik';

import { SelectItem } from './ui/select';
import { Textarea, TextareaInput } from './ui/textarea';

import { CURRENCIES } from '@/constants/currency';
import { InvestmentFormikProps } from '@/hooks/useInvestmentsFormik';
import { AccountProps, InvestmentType } from '@/types';
import AmountInput from './AmountInput';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';

interface InvestmentFormProps {
  formik: FormikProps<InvestmentFormikProps>;
  accounts: AccountProps[];
}

const InvestmentForm = ({ formik, accounts }: InvestmentFormProps) => {
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
          onValueChange={formik.handleChange('type')}
        >
          {Object.values(InvestmentType).map((value) => (
            <SelectItem
              key={value}
              label={value}
              value={value}
            />
          ))}
        </SelectGroup>
      </FormGroup>

      {/* Value */}
      <FormGroup
        label='Value'
        isInvalid={Boolean(formik.errors.value && formik.touched.value)}
        isRequired
        errorText={formik.errors.value}
      >
        <AmountInput
          value={formik.values.value}
          onChangeText={formik.handleChange('value')}
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
    </>
  );
};

export default InvestmentForm;
