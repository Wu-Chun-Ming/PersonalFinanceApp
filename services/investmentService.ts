import {
  destroyInvestment,
  getInvestments,
  showInvestment,
  storeInvestment,
  updateInvestment,
} from '@/database/investmentDatabase';
import { DatabaseOptions, InvestmentProps, InvestmentType } from '@/types';

// Fetch investments
export const fetchInvestments = async (options?: DatabaseOptions) => {
  const response = await getInvestments(options);
  return response.data;
};

// Fetch single investment
export const fetchInvestment = async (id: number) => {
  const response = await showInvestment(id);
  return response.data;
};

// Fetch investment by account ID
export const fetchInvestmentByAccountId = async (accountId: number) => {
  const investments = await fetchInvestments();
  return (
    investments.find(
      (investment) =>
        investment.accountId === accountId &&
        investment.type === InvestmentType.CASH_MANAGEMENT,
    ) || null
  );
};

// Create investment
export const createInvestment = async (investmentData: InvestmentProps) => {
  const response = await storeInvestment(investmentData);
  return response.data;
};

// Edit investment
export const editInvestment = async (
  id: number,
  updatedInvestmentData: InvestmentProps,
) => {
  const response = await updateInvestment(updatedInvestmentData, id);
  return response.data;
};

// Delete investment
export const deleteInvestment = async (id: number) => {
  const response = await destroyInvestment(id);
  return response.data;
};

// Update investment value by account ID
export const updateInvestmentValueByAccountId = async (
  accountId: number,
  amount: number,
) => {
  const investment = await fetchInvestmentByAccountId(accountId);
  if (!investment) {
    console.log(`Investment with accountId ${accountId} not found.`);
    return;
  }

  await editInvestment(investment.id!, { ...investment, value: amount });
};
