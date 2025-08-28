import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={{
        drawerPosition: 'right',
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
    </Drawer>
  );
}
