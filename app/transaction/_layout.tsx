import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ScanProvider } from '@/contexts/ScanContext';

export default function RootLayout() {
  return (
    <ScanProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#25292e',
          },
          headerShadowVisible: false,
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen
          name='[transactionId]'
          options={{ title: '' }}
        />
        <Stack.Screen
          name='listing'
          options={{
            title: 'Transaction Listing',
          }}
        />
        <Stack.Screen
          name='scan'
          options={{
            title: 'Image Scanning',
          }}
        />
      </Stack>
      <StatusBar
        style='auto'
        backgroundColor='#25292e'
        translucent={false}
      />
    </ScanProvider>
  );
}
