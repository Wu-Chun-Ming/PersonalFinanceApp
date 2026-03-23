import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MenuProvider } from 'react-native-popup-menu';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Gluestack UI
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

// Custom import
import { checkDatabaseInitialization } from "@/database/init";
import { useLastOpenDate } from '@/hooks/useLastOpenDate';
import { AppProviders } from '@/providers/AppProvider';
import { handleRecurringTransactions } from "@/services/transactionService";

// Initialize QueryClient
const queryClient = new QueryClient();

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
      <GluestackUIProvider mode="light">
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <MenuProvider>
              <AppProviders>
                <Stack
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="(drawer)" />
                  <Stack.Screen name="transaction" />
                  <Stack.Screen name="goal" />
                </Stack>
              </AppProviders>
            </MenuProvider>
          </GestureHandlerRootView>
          <StatusBar style="auto" backgroundColor="#25292e" translucent={false} />
        </QueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
