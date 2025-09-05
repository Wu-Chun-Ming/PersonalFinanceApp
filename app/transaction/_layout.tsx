import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useState } from 'react';

export const ScanContext = createContext(null);

export default function RootLayout() {
  const [scannedData, setScannedData] = useState(null);

  return (
    <ScanContext.Provider value={{ scannedData, setScannedData }}>
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
        <Stack.Screen name="[transactionId]" options={{ title: '' }} />
        <Stack.Screen name="listing" options={{
          title: 'Transaction Listing',
        }} />
        <Stack.Screen name="scan" options={{
          title: 'Image Scanning',
        }} />
      </Stack>
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </ScanContext.Provider>
  );
}
