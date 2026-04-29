import { useContext } from 'react';

import LLMContext from '@/contexts/LLMContext';

export const useLLMContext = () => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLMContext must be used within a LLMProvider');
  }
  return context;
};
