import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen name="goal" options={{
        title: 'Goals',
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'flag' : 'flag-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="transactions" options={{
        title: 'Transactions',
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'wallet' : 'wallet-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="index" 
      options={{
        title: 'Home',
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="budget" options={{
        title: 'Budget',
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'funnel' : 'funnel-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        headerTitleAlign: 'center',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24} />
        ),
      }} />
    </Tabs>
  );
}
