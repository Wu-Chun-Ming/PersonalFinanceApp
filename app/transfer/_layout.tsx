import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TransferLayout() {
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
          name='[transferId]'
          options={{ title: '' }}
        />
        <Stack.Screen
          name='listing'
          options={{
            title: 'Transfer Listing',
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
