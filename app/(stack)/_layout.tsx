import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function StackLayout() {
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
          name='settings'
          options={{
            title: 'Settings',
          }}
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
