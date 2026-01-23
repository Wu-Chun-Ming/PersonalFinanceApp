import { createContext, ReactNode } from 'react';
import {
    OCR_ENGLISH,
    OCRDetection,
    RnExecutorchError,
    useOCR,
} from 'react-native-executorch';

// From react-native-executorch/src/hooks/computer_vision/useOCR.ts
interface OCRModule {
    error: RnExecutorchError | null;
    isReady: boolean;
    isGenerating: boolean;
    forward: (imageSource: string) => Promise<OCRDetection[]>;
    downloadProgress: number;
}

const OcrContext = createContext<OCRModule | undefined>(undefined);

export const OcrProvider = ({ children }: { children: ReactNode }) => {
    const ocrModel = useOCR({ model: OCR_ENGLISH });

    return (
        <OcrContext.Provider value={ocrModel}>
            {children}
        </OcrContext.Provider>
    );
};

export default OcrContext;