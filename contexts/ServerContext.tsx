import {
    getServerConfig,
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
};

type ServerContextType = {
    serverConfig: ServerConfig;
    error: string | null;
    updateAndRefreshServerConfig: (params: {
        newServerUrl: string;
    }) => Promise<void>;
    isServerConfigured: boolean;
};

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const ServerProvider = ({ children }: { children: ReactNode }) => {
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