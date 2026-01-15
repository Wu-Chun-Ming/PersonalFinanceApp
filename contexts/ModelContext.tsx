import {
    getModelConfig,
    updateApiKey,
    updateModelName,
    updateModelTimeout,
} from '@/services/appConfig';
import {
    createContext,
    ReactNode,
    useEffect,
    useState,
} from 'react';

type ModelConfig = {
    modelName: string | null;
    apiKey: string | null;
    timeout: number | null;
}

type ModelContextType = {
    modelConfig: ModelConfig;
    error: string | null;
    updateAndRefreshModelConfig: (params: {
        newModelName: string;
        newApiKey: string;
        newTimeout: number;
    }) => Promise<void>;
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
            setError("Failed to load model configuration: " + (err as Error).message);
        }
    };

    const update = async ({
        newModelName,
        newApiKey,
        newTimeout,
    }: {
        newModelName: string;
        newApiKey: string;
        newTimeout: number;
    }) => {
        await updateModelName(newModelName);
        await updateApiKey(newApiKey);
        await updateModelTimeout(newTimeout);
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