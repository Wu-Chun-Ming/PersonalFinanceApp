import {
  destroyTransfer,
  getTransfers,
  showTransfer,
  storeTransfer,
  updateTransfer,
} from '@/database/transferDatabase';
import { DatabaseOptions, TransferProps } from '@/types';

// Fetch transfers
export const fetchTransfers = async (options?: DatabaseOptions) => {
  const response = await getTransfers(options);
  return response.data;
};

// Fetch single transfer
export const fetchTransfer = async (id: number) => {
  const response = await showTransfer(id);
  return response.data;
};

// Create transfers
export const createTransfers = async (newTransferData: TransferProps) => {
  const response = await storeTransfer(newTransferData);
  return response.data;
};

// Edit transfer
export const editTransfer = async (
  id: number,
  updatedTransferData: TransferProps,
) => {
  const response = await updateTransfer(updatedTransferData, id);
  return response.data;
};

// Delete transfer
export const deleteTransfer = async (id: number) => {
  const response = await destroyTransfer(id);
  return response.data;
};
