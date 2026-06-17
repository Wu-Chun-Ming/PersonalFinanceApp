import { importAllData } from '@/services/backupService';
import { FileType } from '@/types';
import { useCustomMutation } from './useAppMutation';

// Custom hook for importing data from a backup file
export const useImport = () => {
  return useCustomMutation({
    mutationFn: (fileType: FileType) => importAllData(fileType),
    invalidateKeys: () => [
      ['transactions', 'budget', 'accounts', 'investments'],
    ], // Invalidate transactions and budget queries on success
  });
};
