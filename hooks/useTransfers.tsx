import { router } from 'expo-router';

import { updateAccountBalance } from '@/services/accountService';
import {
  createTransfers,
  deleteTransfer,
  editTransfer,
  fetchTransfer,
  fetchTransfers,
} from '@/services/transferService';
import { DatabaseOptions, TransferProps } from '@/types';
import { useCustomMutation } from './useAppMutation';
import { useCustomQuery } from './useAppQuery';

// Custom hook to fetch transfers
export const useTransfers = (options?: DatabaseOptions) => {
  return useCustomQuery<TransferProps[]>({
    queryKey: ['transfers'],
    queryFn: () => fetchTransfers(options),
    fallbackValue: [],
  });
};

// Custom hook to fetch a single transfer
export const useTransfer = (transferId: number) => {
  return useCustomQuery<TransferProps | null>({
    queryKey: ['transfer', transferId],
    queryFn: () => fetchTransfer(Number(transferId)),
    fallbackValue: null,
    onError: () => router.back(), // Navigate back if error occurs
    options: {
      enabled: !!transferId,
    },
  });
};

// Custom hook to create a transfer
export const useCreateTransfer = () => {
  return useCustomMutation({
    mutationFn: async (newTransferData: TransferProps) => {
      const result = await createTransfers(newTransferData);
      if (result.success && result.id) {
        // Deduct the amount from the source account
        updateAccountBalance(
          newTransferData.fromAccountId,
          -newTransferData.amount,
        );
        // Add the amount to the destination account
        updateAccountBalance(
          newTransferData.toAccountId,
          newTransferData.amount,
        );
      }
      return result;
    },
    invalidateKeys: () => [['transfers']], // Invalidate transfers query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after creating transfer
  });
};

// Custom hook to update a transfer
export const useUpdateTransfer = () => {
  return useCustomMutation({
    mutationFn: ({
      id,
      updatedTransferData,
    }: {
      id: number;
      updatedTransferData: TransferProps;
    }) => editTransfer(id, updatedTransferData),
    invalidateKeys: (variables) => [
      ['transfer', variables?.id],
      ['transfers'], // Invalidate transfer and transfers queries on success
    ],
  });
};

// Custom hook to delete a transfer
export const useDeleteTransfer = () => {
  return useCustomMutation({
    mutationFn: (id: number) => deleteTransfer(id),
    invalidateKeys: () => [['transfers']], // Invalidate transfers query on success
    onInvalidationComplete: () => router.back(), // Navigate to previous page after deleting transfer
  });
};
