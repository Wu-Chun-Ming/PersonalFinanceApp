import * as Yup from 'yup';

import { ACCOUNT_TYPES } from '@/constants/account';
import { CURRENCIES } from '@/constants/currency';

export const accountSchema = Yup.object().shape({
  name: Yup.string().required('Account name is required'),
  type: Yup.string()
    .oneOf(ACCOUNT_TYPES, 'Invalid account type')
    .required('Account type is required'),
  balance: Yup.number()
    .typeError('Balance must be a number')
    .required('Balance is required'),
  currency: Yup.string()
    .oneOf(CURRENCIES, 'Invalid currency')
    .required('Currency is required'),
  earnReturns: Yup.boolean().required('Earn Returns is required'),
});
