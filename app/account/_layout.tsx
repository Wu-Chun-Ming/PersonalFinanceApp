import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function AccountLayout() {
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
        <Stack.Screen
          name='[accountId]'
          options={{ title: '' }}
        />
      </Stack>
      <StatusBar
        style='auto'
        backgroundColor='#25292e'
        translucent={false}
      />
    </>
  );
}
