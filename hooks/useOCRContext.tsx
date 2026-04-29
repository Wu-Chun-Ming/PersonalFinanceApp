import { useContext } from 'react';

import OCRContext from '@/contexts/OCRContext';

export const useOCRContext = () => {
  const context = useContext(OCRContext);
  if (!context) {
    throw new Error('useOCRContext must be used within a OCRProvider');
  }
  return context;
};
