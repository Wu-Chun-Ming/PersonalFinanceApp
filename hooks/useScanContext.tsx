import { useContext } from 'react';

import ScanContext from '@/contexts/ScanContext';

export const useScanContext = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
};
