import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
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
        <Stack.Screen name="goal_settings" options={{
          title: 'Goal Settings',
        }} />
      </Stack>
      <StatusBar style="light" backgroundColor="transparent" translucent />
    </>
  );
}
