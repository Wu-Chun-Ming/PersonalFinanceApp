import { FormikProps } from 'formik';

import { AccountProps, AccountTypeValue } from '@/types';
import { accountSchema } from '@/validation/accountSchema';
import { useCreateAccount, useUpdateAccount } from './useAccounts';
import { useCustomFormik } from './useAppFormik';

export interface AccountFormikProps {
  name: string;
  type: string;
  balance: string;
  currency: string;
  earnReturns: boolean;
}

export const useAccountFormik = (
  formAction: 'create' | 'update',
  accountId: number,
  initialAccount?: AccountFormikProps,
): { accountFormik: FormikProps<AccountFormikProps> } => {
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();

  const accountFormik = useCustomFormik({
    initialValues: initialAccount || {
      name: '',
      type: '',
      balance: '0',
      currency: '',
      earnReturns: false,
    },
    validationSchema: accountSchema,
    transformValues: (values: AccountFormikProps): AccountProps => ({
      ...values,
      type: values.type as AccountTypeValue,
      balance: Number(values.balance),
      updated_at: new Date().toISOString(),
    }),
    onSubmitCallback: (transformedAccountData: AccountProps) => {
      switch (formAction) {
        case 'create':
          createMutation.mutate(transformedAccountData);
          break;
        case 'update':
          updateMutation.mutate({
            id: Number(accountId),
            updatedAccountData: transformedAccountData,
          });
          break;
      }
    },
  });

  return {
    accountFormik,
  };
};
