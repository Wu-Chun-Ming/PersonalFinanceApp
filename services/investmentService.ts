import {
  destroyInvestment,
  getInvestments,
  showInvestment,
  storeInvestment,
  updateInvestment,
} from '@/database/investmentDatabase';
import { DatabaseOptions, InvestmentProps } from '@/types';

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
