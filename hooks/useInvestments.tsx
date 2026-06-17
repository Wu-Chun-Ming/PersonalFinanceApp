import { useMemo } from 'react';
import { router } from 'expo-router';

import { INVESTMENT_TYPE_COLORS } from '@/constants/colors';
import { INVESTMENT_TYPES } from '@/constants/investment';
import {
  createInvestment,
  deleteInvestment,
  editInvestment,
  fetchInvestment,
  fetchInvestments,
} from '@/services/investmentService';
import { DatabaseOptions, InvestmentProps, InvestmentTypeValue } from '@/types';
import { useCustomMutation } from './useAppMutation';
import { useCustomQuery } from './useAppQuery';

// Custom hook to fetch investments
export const useInvestments = (options?: DatabaseOptions) => {
  return useCustomQuery<InvestmentProps[]>({
    queryKey: ['investments'],
    queryFn: () => fetchInvestments(options),
    fallbackValue: [],
  });
};

// Custom hook to fetch a single investment
export const useInvestment = (investmentId: number) => {
  return useCustomQuery<InvestmentProps | null>({
    queryKey: ['investment', investmentId],
    queryFn: () => fetchInvestment(Number(investmentId)),
    fallbackValue: null,
    onError: () => router.back(), // Navigate back if error occurs
    options: {
      enabled: !!investmentId,
    },
  });
};

// Custom hook to create a investment
export const useCreateInvestment = () => {
  return useCustomMutation({
    mutationFn: (newInvestmentData: InvestmentProps) =>
      createInvestment(newInvestmentData),
    invalidateKeys: () => [['investments']], // Invalidate investments query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after creating investment
  });
};

// Custom hook to update a investment
export const useUpdateInvestment = () => {
  return useCustomMutation({
    mutationFn: ({
      id,
      updatedInvestmentData,
    }: {
      id: number;
      updatedInvestmentData: InvestmentProps;
    }) => editInvestment(id, updatedInvestmentData),
    invalidateKeys: (variables) => [
      ['investment', variables?.id],
      ['investments'], // Invalidate investment and investments queries on success
    ],
  });
};

// Custom hook to delete a investment
export const useDeleteInvestment = () => {
  return useCustomMutation({
    mutationFn: (id: number) => deleteInvestment(id),
    invalidateKeys: () => [['investments']], // Invalidate investments query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after deleting investment
  });
};

// Custom hook to process investments data
export const useInvestmentData = (investments: InvestmentProps[]) => {
  return useMemo(() => {
    const buckets = {
      investmentsByType: Object.fromEntries(
        INVESTMENT_TYPES.map((type) => [type, [] as InvestmentProps[]]),
      ) as Record<InvestmentTypeValue, InvestmentProps[]>,
    };
    let lastUpdatedDate = null;

    for (const investment of investments) {
      const { type, updated_at } = investment;
      if (!buckets.investmentsByType[type]) {
        buckets.investmentsByType[type] = [];
      }
      buckets.investmentsByType[type].push(investment);

      if (new Date(updated_at) > new Date(lastUpdatedDate || 0)) {
        lastUpdatedDate = updated_at;
      }
    }

    return {
      investmentsByType: buckets.investmentsByType,
      lastUpdatedDate,
    };
  }, [investments]);
};

// Custom hook to summarize investment data
export const useInvestmentSummary = (investments: InvestmentProps[]) => {
  // Calculate total value per investment type and overall total value
  const { totalValuePerInvestmentType, overallValue } = useMemo(() => {
    const totalValuePerInvestmentType: Record<InvestmentTypeValue, number> =
      Object.fromEntries(INVESTMENT_TYPES.map((type) => [type, 0])) as Record<
        InvestmentTypeValue,
        number
      >;

    let overallValue = 0;

    for (let i = 0; i < investments.length; i++) {
      const { type, value } = investments[i];

      totalValuePerInvestmentType[type] =
        (totalValuePerInvestmentType[type] ?? 0) + value;
      overallValue += value;
    }

    return {
      totalValuePerInvestmentType,
      overallValue,
    };
  }, [investments]);

  // Calculate percentage for each investment type
  const percentagesPerType = useMemo(() => {
    const percentages: Record<InvestmentTypeValue, number> = Object.fromEntries(
      INVESTMENT_TYPES.map((type) => [type, 0]),
    ) as Record<InvestmentTypeValue, number>;

    for (const type of INVESTMENT_TYPES) {
      percentages[type] = overallValue
        ? (totalValuePerInvestmentType[type] / overallValue) * 100
        : 0;
    }

    return percentages;
  }, [totalValuePerInvestmentType, overallValue]);

  return {
    totalValuePerInvestmentType,
    overallValue,
    percentagesPerType,
  };
};

// Custom hook to prepare data for pie chart visualization
export const usePieChartInvestments = (investments: InvestmentProps[]) => {
  const { totalValuePerInvestmentType } = useInvestmentSummary(investments);

  // Calculate totals by type
  const investmentPerType = useMemo(() => {
    return INVESTMENT_TYPES.map((type) => ({
      label: type,
      value: totalValuePerInvestmentType[type] ?? 0,
      color: INVESTMENT_TYPE_COLORS[type],
    }));
  }, [totalValuePerInvestmentType]);

  return {
    investmentPerType,
  };
};
