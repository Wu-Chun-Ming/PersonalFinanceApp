import { useEffect } from 'react';
import { initExecutorch } from 'react-native-executorch';
import { ExpoResourceFetcher } from 'react-native-executorch-expo-resource-fetcher';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { en, registerTranslation, zh } from 'react-native-paper-dates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getLocales } from 'expo-localization';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Gluestack UI
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

// Custom import
import { checkDatabaseInitialization } from '@/database/init';
import { useLastOpenDate } from '@/hooks/useLastOpenDate';
import { AppProviders } from '@/providers/AppProvider';
import { handleRecurringTransactions } from '@/services/transactionService';
import '@/global.css';

// Initialize QueryClient
const queryClient = new QueryClient();

// Register translations for react-native-paper-dates
const locale = getLocales()[0];
const { languageTag } = locale;
const translations = {
  en,
  zh,
};
const map: Record<string, keyof typeof translations> = {
  'en-US': 'en',
  'en-GB': 'en',
  'zh-CN': 'zh',
  'zh-SG': 'zh',
};
const languageCode = map[languageTag] || locale.languageCode || 'en';

registerTranslation(languageCode, translations[languageCode] || en);

// Initialize Executorch with ExpoResourceFetcher
initExecutorch({
  resourceFetcher: ExpoResourceFetcher,
});

export default function RootLayout() {
  const { lastOpenDate, updateAndRefreshLastOpenDate } = useLastOpenDate();

  // App startup
  useEffect(() => {
    checkDatabaseInitialization();
  }, []);

  useEffect(() => {
    if (lastOpenDate) handleRecurringTransactions(lastOpenDate);
    updateAndRefreshLastOpenDate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode='light'>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProviders>
              <Stack
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name='(drawer)' />
                <Stack.Screen name='(stack)' />
                <Stack.Screen name='transaction' />
                <Stack.Screen name='goal' />
              </Stack>
            </AppProviders>
          </GestureHandlerRootView>
          <StatusBar
            style='auto'
            backgroundColor='#25292e'
            translucent={false}
          />
        </QueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
