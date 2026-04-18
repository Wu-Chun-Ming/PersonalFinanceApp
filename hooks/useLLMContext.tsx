import LLMContext from '@/contexts/LLMContext';
import { useContext } from 'react';

export const useLLMContext = () => {
    const context = useContext(LLMContext);
    if (!context) {
        throw new Error('useLLMContext must be used within a LLMProvider');
    }
    return context;
};