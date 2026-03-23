import { TransactionFormikProps } from '@/hooks/useTransactionsFormik';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useState } from 'react';

interface ScanContextType {
  scannedData: TransactionFormikProps[];
  setScannedData: React.Dispatch<React.SetStateAction<TransactionFormikProps[]>>;
}

export const ScanContext = createContext<ScanContextType | undefined>(undefined);

export default function RootLayout() {
  const [scannedData, setScannedData] = useState<TransactionFormikProps[]>([]);

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
      <StatusBar style="auto" backgroundColor="#25292e" translucent={false} />
    </ScanContext.Provider>
  );
}
