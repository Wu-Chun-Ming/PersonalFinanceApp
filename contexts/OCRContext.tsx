import {
    createContext,
    ReactNode,
} from 'react';
import {
    OCR_ENGLISH,
    OCRType,
    useOCR,
} from 'react-native-executorch';

const OCRContext = createContext<OCRType | undefined>(undefined);

export const OCRProvider = ({ children }: { children: ReactNode }) => {
    const ocrModel = useOCR({ model: OCR_ENGLISH });

    return (
        <OCRContext.Provider value={ocrModel}>
            {children}
        </OCRContext.Provider>
    );
};

export default OCRContext;