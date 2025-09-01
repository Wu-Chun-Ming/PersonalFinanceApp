import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useState } from 'react';

export const ScanContext = createContext(null);

export default function RootLayout() {
  const [scannedData, setScannedData] = useState(null);

  return (
    <ScanContext.Provider value={{ scannedData, setScannedData }}>
      <Stack>
        <Stack.Screen name="[transactionId]" options={{ title: '' }} />
        <Stack.Screen name="listing" options={{
          title: 'Transaction Listing',
          headerTitleAlign: 'center',
        }} />
        <Stack.Screen name="scan" options={{
          title: 'Image Scanning',
          headerTitleAlign: 'center',
        }} />
      </Stack>
      <StatusBar style="light" />
    </ScanContext.Provider>
  );
}
