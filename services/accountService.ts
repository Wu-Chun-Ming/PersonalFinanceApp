import {
  destroyAccount,
  getAccounts,
  showAccount,
  storeAccount,
  updateAccount,
} from '@/database/accountDatabase';
import { AccountProps, DatabaseOptions, FileType } from '@/types';
import { exportData, importData, pickFile } from '@/utils/io';

// Fetch accounts
export const fetchAccounts = async (options?: DatabaseOptions) => {
  const response = await getAccounts(options);
  return response.data;
};

// Fetch single account
export const fetchAccount = async (id: number) => {
  const response = await showAccount(id);
  return response.data;
};

// Create account
export const createAccount = async (accountData: AccountProps) => {
  const response = await storeAccount(accountData);
  return response.data;
};

// Edit account
export const editAccount = async (
  id: number,
  updatedAccountData: AccountProps,
) => {
  const response = await updateAccount(updatedAccountData, id);
  return response.data;
};

// Delete account
export const deleteAccount = async (id: number) => {
  const response = await destroyAccount(id);
  return response.data;
};

// Export all accounts
export const exportAllAccounts = async (fileType: FileType) => {
  return exportData<AccountProps>(
    fileType,
    async () => {
      const { data } = await getAccounts();
      return data;
    },
    'exported_accounts',
    'account',
  );
};

// Import accounts from file
export const importAccounts = async (fileType: FileType) => {
  const fileUri = await pickFile(fileType);

  return importData<AccountProps>(
    fileType,
    async (account) => {
      const response = await storeAccount(account as AccountProps);
      return response.data.success;
    },
    'account',
    fileUri,
  );
};
