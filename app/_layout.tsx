import "@/global.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';

// Gluestack UI
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

// Initialize QueryClient
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GluestackUIProvider mode="light">
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="transaction" options={{ headerShown: false }} />
          <Stack.Screen name="goal" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </QueryClientProvider>
    </GluestackUIProvider>
  );
}
