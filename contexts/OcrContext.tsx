import {
    createContext,
    ReactNode,
} from 'react';
import {
    OCR_ENGLISH,
    OCRType,
    useOCR,
} from 'react-native-executorch';

const OcrContext = createContext<OCRType | undefined>(undefined);

export const OcrProvider = ({ children }: { children: ReactNode }) => {
    const ocrModel = useOCR({ model: OCR_ENGLISH });

    return (
        <OcrContext.Provider value={ocrModel}>
            {children}
        </OcrContext.Provider>
    );
};

export default OcrContext;