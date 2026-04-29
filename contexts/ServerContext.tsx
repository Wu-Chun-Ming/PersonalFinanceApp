import { createContext, ReactNode, useEffect, useState } from 'react';

import {
  getServerConfig,
  updateServerTimeout,
  updateServerUrl,
} from '@/services/appConfig';

type ServerConfig = {
  serverUrl: string | null;
  timeout: number | null;
};

type UpdateServerConfigParams = {
  newServerUrl: string;
  newTimeoutSeconds: number;
};

type ServerContextType = {
  serverConfig: ServerConfig;
  error: string | null;
  updateAndRefreshServerConfig: (
    params: UpdateServerConfigParams,
  ) => Promise<void>;
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
      setError(
        'Failed to load server configuration: ' + (err as Error).message,
      );
    }
  };

  const update = async ({
    newServerUrl,
    newTimeoutSeconds,
  }: UpdateServerConfigParams) => {
    await updateServerUrl(newServerUrl);
    await updateServerTimeout(newTimeoutSeconds);
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
