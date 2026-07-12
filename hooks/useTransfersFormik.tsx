import { FormikProps } from 'formik';

import { TransferProps } from '@/types';
import { transferSchema } from '@/validation/transferSchema';
import { useCustomFormik } from './useAppFormik';
import { useCreateTransfer, useUpdateTransfer } from './useTransfers';

export interface TransferFormikProps {
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
  currency: string;
}

export const useTransferFormik = (
  formAction: 'create' | 'update',
  transferId: number,
  initialTransfer?: TransferFormikProps,
): { transferFormik: FormikProps<TransferFormikProps> } => {
  const createMutation = useCreateTransfer();
  const updateMutation = useUpdateTransfer();

  const transferFormik = useCustomFormik({
    initialValues: initialTransfer || {
      date: new Date().toString(),
      fromAccountId: '',
      toAccountId: '',
      amount: '',
      description: '',
      currency: '',
    },
    validationSchema: transferSchema,
    transformValues: (values: TransferFormikProps): TransferProps => ({
      ...values,
      fromAccountId: Number(values.fromAccountId),
      toAccountId: Number(values.toAccountId),
      amount: Number(values.amount),
      date: new Date(values.date),
    }),
    onSubmitCallback: (transformedTransferData: TransferProps) => {
      switch (formAction) {
        case 'create':
          createMutation.mutate(transformedTransferData);
          break;
        case 'update':
          updateMutation.mutate({
            id: Number(transferId),
            updatedTransferData: transformedTransferData,
          });
          break;
      }
    },
  });

  return {
    transferFormik,
  };
};
