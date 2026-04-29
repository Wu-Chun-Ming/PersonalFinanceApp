import { ReactNode } from 'react';

import { LLMProvider } from '@/contexts/LLMContext';
import { ModelProvider } from '@/contexts/ModelContext';
import { OCRProvider } from '@/contexts/OCRContext';
import { ServerProvider } from '@/contexts/ServerContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ServerProvider>
      <ModelProvider>
        <LLMProvider>
          <OCRProvider>{children}</OCRProvider>
        </LLMProvider>
      </ModelProvider>
    </ServerProvider>
  );
}
