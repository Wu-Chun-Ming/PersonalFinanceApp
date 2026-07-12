import * as Yup from 'yup';

import { CURRENCIES } from '@/constants/currency';

export const transferSchema = Yup.object().shape({
  date: Yup.date().required('Date is required'),
  fromAccountId: Yup.number().required('From Account ID is required'),
  toAccountId: Yup.number()
    .required('To Account ID is required')
    .notOneOf(
      [Yup.ref('fromAccountId')],
      'To Account cannot be the same as From Account',
    ),
  amount: Yup.number()
    .typeError('Must be a number')
    .positive('Amount must be positive')
    .required('Amount is required'),
  description: Yup.string().required('Description is required'),
  currency: Yup.string()
    .oneOf(CURRENCIES, 'Invalid currency')
    .required('Currency is required'),
});
