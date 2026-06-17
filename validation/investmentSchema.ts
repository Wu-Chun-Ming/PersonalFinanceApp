import * as Yup from 'yup';

import { CURRENCIES } from '@/constants/currency';
import { INVESTMENT_TYPES } from '@/constants/investment';

export const investmentSchema = Yup.object().shape({
  accountId: Yup.number()
    .typeError('Must be a number')
    .required('Account is required'),
  name: Yup.string().required('Name is required'),
  type: Yup.string()
    .oneOf(INVESTMENT_TYPES, 'Invalid type')
    .required('Investment type is required'),
  value: Yup.number()
    .typeError('Value must be a number')
    .required('Value is required'),
  currency: Yup.string()
    .oneOf(CURRENCIES, 'Invalid currency')
    .required('Currency is required'),
});
