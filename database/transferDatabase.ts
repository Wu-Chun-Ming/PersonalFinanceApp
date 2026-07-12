import * as SQLite from 'expo-sqlite';

// Custom import
import {
  deleteRow,
  getAllData,
  getRowByPrimaryKey,
  insertRow,
  updateRow,
} from '@/database';
import { DatabaseOptions, TransferProps } from '@/types';
import { transferTableColumns } from './schema';

const getTransferValues = (transfer: TransferProps) => {
  return [
    transfer.date.toString(),
    transfer.fromAccountId,
    transfer.toAccountId,
    transfer.amount * 100, // Convert to cents
    transfer.description,
    transfer.currency,
  ];
};

const transformTransfer = (transfer: any): TransferProps => {
  return {
    ...transfer,
    date: transfer.date ? new Date(transfer.date) : null,
    amount: transfer.amount / 100,
  };
};

// Fetch all transfers
export const getTransfers = async (options?: DatabaseOptions) => {
  return getAllData<TransferProps>('transfers', options, transformTransfer);
};

// Fetch specific transfer
export const showTransfer = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return getRowByPrimaryKey<TransferProps>(
    'transfers',
    'id',
    id,
    { dbInstance },
    transformTransfer,
  );
};

// Store new transfer
export const storeTransfer = async (
  transfer: TransferProps,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return insertRow(
    'transfers',
    preserveId ? transferTableColumns : transferTableColumns.slice(1), // Exclude 'id' column for insertion if not preserving
    [...(preserveId ? [transfer.id] : []), ...getTransferValues(transfer)],
    { dbInstance },
  );
};

// Update transfer details
export const updateTransfer = async (
  transfer: TransferProps,
  id: number,
  preserveId: boolean = false,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return updateRow(
    'transfers',
    preserveId ? transferTableColumns : transferTableColumns.slice(1), // Exclude 'id' column for update if not preserving
    [...(preserveId ? [transfer.id] : []), ...getTransferValues(transfer)],
    'id',
    id,
    { dbInstance },
  );
};

// Delete transfer
export const destroyTransfer = async (
  id: number,
  dbInstance?: SQLite.SQLiteDatabase,
) => {
  return deleteRow('transfers', 'id', id, { dbInstance });
};
