import OCRContext from '@/contexts/OCRContext';
import { useContext } from 'react';

export const useOCRContext = () => {
    const context = useContext(OCRContext);
    if (!context) {
        throw new Error('useOCRContext must be used within a OCRProvider');
    }
    return context;
};