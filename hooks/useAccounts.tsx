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
import { AccountProps, AccountTypeValue, DatabaseOptions } from '@/types';
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
    mutationFn: (newAccountData: AccountProps) => createAccount(newAccountData),
    invalidateKeys: () => [['accounts']], // Invalidate accounts query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after creating account
  });
};

// Custom hook to update a account
export const useUpdateAccount = () => {
  return useCustomMutation({
    mutationFn: ({
      id,
      updatedAccountData,
    }: {
      id: number;
      updatedAccountData: AccountProps;
    }) => editAccount(id, updatedAccountData),
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

    for (const account of accounts) {
      const { type } = account;
      if (!buckets.accountsByType[type]) {
        buckets.accountsByType[type] = [];
      }
      buckets.accountsByType[type].push(account);
    }

    return {
      accountsByType: buckets.accountsByType,
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
