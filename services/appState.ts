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