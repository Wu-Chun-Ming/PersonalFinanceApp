import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="goal_settings" options={{
          title: 'Goal Settings',
          headerTitleAlign: 'center',
        }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
