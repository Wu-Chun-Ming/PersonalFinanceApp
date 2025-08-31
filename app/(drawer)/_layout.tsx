import { Drawer } from 'expo-router/drawer';

// Custom import
import CustomDrawer from '@/components/CustomDrawer';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <CustomDrawer />}
      screenOptions={{
        drawerPosition: 'right',
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ headerShown: false }} />
    </Drawer>
  );
}
