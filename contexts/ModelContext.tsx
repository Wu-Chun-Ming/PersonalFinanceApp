import { createContext, ReactNode, useEffect, useState } from 'react';

import {
  getModelConfig,
  updateApiKey,
  updateModelName,
  updateModelTimeout,
} from '@/services/appConfig';

type ModelConfig = {
  modelName: string | null;
  apiKey: string | null;
  timeout: number | null;
};

type UpdateModelConfigParams = {
  newModelName: string;
  newApiKey: string;
  newTimeoutSeconds: number;
};

type ModelContextType = {
  modelConfig: ModelConfig;
  error: string | null;
  updateAndRefreshModelConfig: (
    params: UpdateModelConfigParams,
  ) => Promise<void>;
  isModelConfigured: boolean;
};

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: ReactNode }) => {
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelName: null,
    apiKey: null,
    timeout: null,
  });
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const config = await getModelConfig();
      setModelConfig(config);
    } catch (err) {
      setError('Failed to load model configuration: ' + (err as Error).message);
    }
  };

  const update = async ({
    newModelName,
    newApiKey,
    newTimeoutSeconds,
  }: UpdateModelConfigParams) => {
    await updateModelName(newModelName);
    await updateApiKey(newApiKey);
    await updateModelTimeout(newTimeoutSeconds);
    await refresh();
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <ModelContext.Provider
      value={{
        modelConfig,
        error,
        updateAndRefreshModelConfig: update,
        isModelConfigured: Boolean(modelConfig.modelName && modelConfig.apiKey),
      }}
    >
      {children}
    </ModelContext.Provider>
  );
};

export default ModelContext;
