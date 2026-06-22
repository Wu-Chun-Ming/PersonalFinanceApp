import { useMemo } from 'react';
import { router } from 'expo-router';

import { ACCOUNT_TYPES } from '@/constants/account';
import { ACCOUNT_TYPE_COLORS } from '@/constants/colors';
import {
  createAccount,
  deleteAccount,
  editAccount,
  fetchAccount,
  fetchAccounts,
} from '@/services/accountService';
import {
  createInvestment,
  updateInvestmentValueByAccountId,
} from '@/services/investmentService';
import {
  AccountProps,
  AccountTypeValue,
  DatabaseOptions,
  InvestmentType,
} from '@/types';
import { useCustomMutation } from './useAppMutation';
import { useCustomQuery } from './useAppQuery';

// Custom hook to fetch accounts
export const useAccounts = (options?: DatabaseOptions) => {
  return useCustomQuery<AccountProps[]>({
    queryKey: ['accounts'],
    queryFn: () => fetchAccounts(options),
    fallbackValue: [],
  });
};

// Custom hook to fetch a single account
export const useAccount = (accountId: number) => {
  return useCustomQuery<AccountProps | null>({
    queryKey: ['account', accountId],
    queryFn: () => fetchAccount(Number(accountId)),
    fallbackValue: null,
    onError: () => router.back(), // Navigate back if error occurs
    options: {
      enabled: !!accountId,
    },
  });
};

// Custom hook to create a account
export const useCreateAccount = () => {
  return useCustomMutation({
    mutationFn: async (newAccountData: AccountProps) => {
      const newAccount = await createAccount(newAccountData);
      if (newAccountData.earnReturns && newAccount.id) {
        await createInvestment({
          accountId: newAccount.id,
          name: `${newAccountData.name} Investment`,
          type: InvestmentType.CASH_MANAGEMENT,
          value: newAccountData.balance,
          currency: newAccountData.currency,
          updated_at: new Date().toISOString(),
        });
      }

      return newAccount;
    },
    invalidateKeys: () => [['accounts']], // Invalidate accounts query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after creating account
  });
};

// Custom hook to update a account
export const useUpdateAccount = () => {
  return useCustomMutation({
    mutationFn: async ({
      id,
      updatedAccountData,
    }: {
      id: number;
      updatedAccountData: AccountProps;
    }) => {
      if (updatedAccountData.earnReturns) {
        await updateInvestmentValueByAccountId(id, updatedAccountData.balance);
      }
      return editAccount(id, updatedAccountData);
    },
    invalidateKeys: (variables) => [
      ['account', variables?.id],
      ['accounts'], // Invalidate account and accounts queries on success
    ],
  });
};

// Custom hook to delete a account
export const useDeleteAccount = () => {
  return useCustomMutation({
    mutationFn: (id: number) => deleteAccount(id),
    invalidateKeys: () => [['accounts']], // Invalidate accounts query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after deleting account
  });
};

// Custom hook to process accounts data
export const useAccountData = (accounts: AccountProps[]) => {
  return useMemo(() => {
    const buckets = {
      accountsByType: Object.fromEntries(
        ACCOUNT_TYPES.map((type) => [type, [] as AccountProps[]]),
      ) as Record<AccountTypeValue, AccountProps[]>,
    };
    let lastUpdatedDate = null;

    for (const account of accounts) {
      const { type, updated_at } = account;
      if (!buckets.accountsByType[type]) {
        buckets.accountsByType[type] = [];
      }
      buckets.accountsByType[type].push(account);

      if (new Date(updated_at) > new Date(lastUpdatedDate || 0)) {
        lastUpdatedDate = updated_at;
      }
    }

    return {
      accountsByType: buckets.accountsByType,
      lastUpdatedDate,
    };
  }, [accounts]);
};

// Custom hook to summarize account data
export const useAccountSummary = (accounts: AccountProps[]) => {
  // Calculate total balance per account type and overall total balance
  const { totalBalancePerAccountType, overallBalance } = useMemo(() => {
    const totalBalancePerAccountType: Record<AccountTypeValue, number> =
      Object.fromEntries(ACCOUNT_TYPES.map((type) => [type, 0])) as Record<
        AccountTypeValue,
        number
      >;

    let overallBalance = 0;

    for (let i = 0; i < accounts.length; i++) {
      const { type, balance } = accounts[i];

      totalBalancePerAccountType[type] =
        (totalBalancePerAccountType[type] ?? 0) + balance;
      overallBalance += balance;
    }

    return {
      totalBalancePerAccountType,
      overallBalance,
    };
  }, [accounts]);

  // Calculate percentage for each account type
  const percentagesPerType = useMemo(() => {
    const percentages: Record<AccountTypeValue, number> = Object.fromEntries(
      ACCOUNT_TYPES.map((type) => [type, 0]),
    ) as Record<AccountTypeValue, number>;

    for (const type of ACCOUNT_TYPES) {
      percentages[type] = overallBalance
        ? (totalBalancePerAccountType[type] / overallBalance) * 100
        : 0;
    }

    return percentages;
  }, [totalBalancePerAccountType, overallBalance]);

  return {
    totalBalancePerAccountType,
    overallBalance,
    percentagesPerType,
  };
};

// Custom hook to prepare data for pie chart visualization
export const usePieChartAccounts = (accounts: AccountProps[]) => {
  const { totalBalancePerAccountType } = useAccountSummary(accounts);

  // Calculate totals by category
  const accountPerType = useMemo(() => {
    return ACCOUNT_TYPES.map((category) => ({
      label: category,
      value: totalBalancePerAccountType[category] ?? 0,
      color: ACCOUNT_TYPE_COLORS[category],
    }));
  }, [totalBalancePerAccountType]);

  return {
    accountPerType,
  };
};
