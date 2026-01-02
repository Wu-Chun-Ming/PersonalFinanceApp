import {
    getModelAndApiKey,
    updateApiKey,
    updateModelName,
} from "@/services/appConfig";
import { useEffect, useState } from "react";

type ModelConfig = {
    modelName: string | null;
    apiKey: string | null;
}

export const useModel = () => {
    const [modelConfig, setModelConfig] = useState<ModelConfig>({
        modelName: null,
        apiKey: null,
    });
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        try {
            const config = await getModelAndApiKey();
            setModelConfig(config);
        } catch (err) {
            setError("Failed to load model configuration: " + (err as Error).message);
        }
    };

    const update = async ({
        newModelName,
        newApiKey,
    }: {
        newModelName: string;
        newApiKey: string;
    }) => {
        await updateModelName(newModelName);
        await updateApiKey(newApiKey);
        await refresh();
    };

    useEffect(() => {
        refresh();
    }, []);

    return {
        modelConfig,
        error,
        updateAndRefreshModelConfig: update,
        isModelConfigured: Boolean(modelConfig.modelName && modelConfig.apiKey),
    };
}