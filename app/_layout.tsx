import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Gluestack UI
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

// Custom import
import { checkDatabaseInitialization } from "@/database/init";
import { useLastOpenDate } from '@/hooks/useLastOpenDate';
import { handleRecurringTransactions } from "@/services/transactions";

// Initialize QueryClient
const queryClient = new QueryClient();

export default function RootLayout() {
  const { lastOpenDate, updateAndRefreshLastOpenDate } = useLastOpenDate();

  useEffect(() => {
    checkDatabaseInitialization();
    if (lastOpenDate) handleRecurringTransactions(lastOpenDate);
    updateAndRefreshLastOpenDate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastOpenDate]);

  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(drawer)" />
              <Stack.Screen name="transaction" />
              <Stack.Screen name="goal" />
            </Stack>
          </GestureHandlerRootView>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
