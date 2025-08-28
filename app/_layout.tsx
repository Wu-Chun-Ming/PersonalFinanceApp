import "@/global.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from "react-native-safe-area-context";

// Gluestack UI
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

// Initialize QueryClient
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider mode="light">
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack>
              <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
              <Stack.Screen name="transaction" options={{ headerShown: false }} />
              <Stack.Screen name="goal" options={{ headerShown: false }} />
            </Stack>
          </GestureHandlerRootView>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
