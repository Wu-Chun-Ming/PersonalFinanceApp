import {
    getServerConfig,
    updateServerUrl,
} from "@/services/appState";
import { useEffect, useState } from "react";

type ServerConfig = {
    serverUrl: string | null;
};

export const useServer = () => {
    const [serverConfig, setServerConfig] = useState<ServerConfig>({
        serverUrl: null,
    });
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        try {
            const serverConfig = await getServerConfig();
            setServerConfig(serverConfig);
        } catch (err) {
            setError("Failed to load server configuration: " + (err as Error).message);
        }
    };

    const update = async ({
        newServerUrl,
    }: {
        newServerUrl: string;
    }) => {
        await updateServerUrl(newServerUrl);
        await refresh();
    };

    useEffect(() => {
        refresh();
    }, []);

    return {
        serverConfig,
        error,
        updateAndRefreshServerConfig: update,
        isServerConfigured: Boolean(serverConfig.serverUrl),
    };
};