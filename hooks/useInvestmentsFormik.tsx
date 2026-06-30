import { FormikProps } from 'formik';

import { InvestmentProps, InvestmentTypeValue } from '@/types';
import { investmentSchema } from '@/validation/investmentSchema';
import { useCustomFormik } from './useAppFormik';
import { useCreateInvestment, useUpdateInvestment } from './useInvestments';

export interface InvestmentFormikProps {
  accountId: string;
  name: string;
  type: string;
  value: string;
  currency: string;
}

export const useInvestmentFormik = (
  formAction: 'create' | 'update',
  investmentId: number,
  initialInvestment?: InvestmentFormikProps,
): { investmentFormik: FormikProps<InvestmentFormikProps> } => {
  const createMutation = useCreateInvestment();
  const updateMutation = useUpdateInvestment();

  const investmentFormik = useCustomFormik({
    initialValues: initialInvestment || {
      accountId: '',
      name: '',
      type: '',
      value: '0',
      currency: '',
    },
    validationSchema: investmentSchema,
    transformValues: (values: InvestmentFormikProps): InvestmentProps => ({
      ...values,
      accountId: Number(values.accountId),
      name: values.name.trim(),
      type: values.type as InvestmentTypeValue,
      value: Number(values.value),
      updated_at: new Date().toISOString(),
    }),
    onSubmitCallback: (transformedInvestmentData: InvestmentProps) => {
      switch (formAction) {
        case 'create':
          createMutation.mutate(transformedInvestmentData);
          break;
        case 'update':
          updateMutation.mutate({
            id: Number(investmentId),
            updatedInvestmentData: transformedInvestmentData,
          });
          break;
      }
    },
  });

  return {
    investmentFormik,
  };
};
