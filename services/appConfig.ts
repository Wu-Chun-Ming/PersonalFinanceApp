import { DEFAULT_TIMEOUT_SEC } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';

// ======================== Server Configuration ========================
let serverUrl: string | null = null;
let serverTimeout: number = DEFAULT_TIMEOUT_SEC;

export const getServerConfig = async () => {
    if (serverUrl !== null && serverTimeout !== null) {
        return { serverUrl, timeout: serverTimeout };
    }

    serverUrl = await SecureStore.getItemAsync('serverUrl');
    const timeoutStr = await SecureStore.getItemAsync('serverTimeout');
    serverTimeout = (timeoutStr !== null) ? Number(timeoutStr) : DEFAULT_TIMEOUT_SEC;

    return { serverUrl, timeout: serverTimeout };
};

export const updateServerUrl = async (newServerUrl: string) => {
    await SecureStore.setItemAsync('serverUrl', newServerUrl);
    serverUrl = newServerUrl;
};

export const updateServerTimeout = async (newTimeout: number) => {
    await SecureStore.setItemAsync('serverTimeout', newTimeout.toString());
    serverTimeout = newTimeout;
}

// ===================== Model Configuration ====================
let modelName: string | null = null;
let apiKey: string | null = null;
let modelTimeout: number = DEFAULT_TIMEOUT_SEC;

export const getModelConfig = async () => {
    if (modelName !== null && apiKey !== null && modelTimeout !== null) {
        return { modelName, apiKey, timeout: modelTimeout };
    }

    modelName = await SecureStore.getItemAsync('model');
    apiKey = await SecureStore.getItemAsync('apiKey');
    const timeoutStr = await SecureStore.getItemAsync('modelTimeout');
    modelTimeout = (timeoutStr !== null) ? Number(timeoutStr) : DEFAULT_TIMEOUT_SEC;

    return { modelName, apiKey, timeout: modelTimeout };
};

export const updateModelName = async (newModelName: string) => {
    await SecureStore.setItemAsync('model', newModelName);
    modelName = newModelName;
};

export const updateApiKey = async (newApiKey: string) => {
    await SecureStore.setItemAsync('apiKey', newApiKey);
    apiKey = newApiKey;
};

export const updateModelTimeout = async (newTimeout: number) => {
    await SecureStore.setItemAsync('modelTimeout', newTimeout.toString());
    modelTimeout = newTimeout;
};