import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="[transactionId]" options={{ title: ''}}/>
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
