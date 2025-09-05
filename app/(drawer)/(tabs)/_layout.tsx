import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const navigation = useNavigation();

  const renderReminderIcon = () => (
    <Pressable
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <MaterialIcons name="notifications" size={25} color="white" style={{
        marginRight: 20,
      }} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerRight: renderReminderIcon,
        tabBarActiveTintColor: '#ffd33d',
        tabBarStyle: {
          backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen name="goals" options={{
        title: 'Goals',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'flag' : 'flag-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="transactions" options={{
        title: 'Transactions',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'wallet' : 'wallet-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="index" options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="budgets" options={{
        title: 'Budgets',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'funnel' : 'funnel-outline'} color={color} size={24} />
        ),
      }} />
      <Tabs.Screen name="settings" options={{
        title: 'Settings',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'settings' : 'settings-outline'} color={color} size={24} />
        ),
      }} />
    </Tabs>
  );
}
