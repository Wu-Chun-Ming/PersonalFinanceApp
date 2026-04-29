import { createContext, ReactNode } from 'react';
import {
  LFM2_VL_1_6B_QUANTIZED,
  LLMTypeMultimodal,
  useLLM,
} from 'react-native-executorch';

const LLMContext = createContext<LLMTypeMultimodal | undefined>(undefined);

export const LLMProvider = ({ children }: { children: ReactNode }) => {
  const llmModel = useLLM({ model: LFM2_VL_1_6B_QUANTIZED });

  return <LLMContext.Provider value={llmModel}>{children}</LLMContext.Provider>;
};

export default LLMContext;
