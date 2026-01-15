import {
    getServerConfig,
    updateServerTimeout,
    updateServerUrl,
} from "@/services/appConfig";
import {
    createContext,
    ReactNode,
    useEffect,
    useState,
} from "react";

type ServerConfig = {
    serverUrl: string | null;
    timeout: number | null;
};

type ServerContextType = {
    serverConfig: ServerConfig;
    error: string | null;
    updateAndRefreshServerConfig: (params: {
        newServerUrl: string;
        newTimeout: number;
    }) => Promise<void>;
    isServerConfigured: boolean;
};

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider = ({ children }: { children: ReactNode }) => {
    const [serverConfig, setServerConfig] = useState<ServerConfig>({
        serverUrl: null,
        timeout: null,
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
        newTimeout,
    }: {
        newServerUrl: string;
        newTimeout: number;
    }) => {
        await updateServerUrl(newServerUrl);
        await updateServerTimeout(newTimeout);
        await refresh();
    };

    useEffect(() => {
        refresh();
    }, []);

    return (
        <ServerContext.Provider
            value={{
                serverConfig,
                error,
                updateAndRefreshServerConfig: update,
                isServerConfigured: Boolean(serverConfig.serverUrl),
            }}
        >
            {children}
        </ServerContext.Provider>
    );
};

export default ServerContext;