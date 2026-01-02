import * as SecureStore from 'expo-secure-store';

let lastOpenDate: Date | null = null;

export const getLastOpenDate = async () => {
    if (lastOpenDate) return lastOpenDate;

    const lastOpenDateStr = await SecureStore.getItemAsync('lastOpenDate');
    if (!lastOpenDateStr) return null;

    lastOpenDate = new Date(lastOpenDateStr);
    if (isNaN(lastOpenDate.getTime())) return null; // safeguard invalid date

    return lastOpenDate;
};

export const updateLastOpenDate = async () => {
    const today = new Date().toISOString();
    await SecureStore.setItemAsync('lastOpenDate', today);
    lastOpenDate = new Date(today);
};

export const getDatabaseInitialized = async () => {
    const dbInitialized = await SecureStore.getItemAsync('dbInitialized');
    return dbInitialized === 'true';
};

export const setDatabaseInitialized = async (initialized: boolean) => {
    await SecureStore.setItemAsync('dbInitialized', initialized ? 'true' : 'false');
}

// ======================== Server URL ========================
let serverUrl: string | null = null;

export const getServerConfig = async () => {
    if (serverUrl !== null) {
        return { serverUrl };
    }

    serverUrl = await SecureStore.getItemAsync('serverUrl');

    return { serverUrl };
};

export const updateServerUrl = async (newServerUrl: string) => {
    await SecureStore.setItemAsync('serverUrl', newServerUrl);
    serverUrl = newServerUrl;
};

// ===================== Model and API Key ====================
let modelName: string | null = null;
let apiKey: string | null = null;

export const getModelAndApiKey = async () => {
    if (modelName !== null && apiKey !== null) {
        return { modelName, apiKey };
    }

    modelName = await SecureStore.getItemAsync('model');
    apiKey = await SecureStore.getItemAsync('apiKey');

    return { modelName, apiKey };
};

export const updateModelName = async (newModelName: string) => {
    await SecureStore.setItemAsync('model', newModelName);
    modelName = newModelName;
};

export const updateApiKey = async (newApiKey: string) => {
    await SecureStore.setItemAsync('apiKey', newApiKey);
    apiKey = newApiKey;
};