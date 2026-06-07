import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Gluestack UI
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';

const MoreScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginHorizontal: 10,
        marginTop: 5,
      }}
      edges={['bottom']}
    >
      {/* Accounts */}
      <TouchableOpacity
        onPress={() => router.push('/(stack)/accounts')}
        style={{
          marginVertical: 5,
          paddingHorizontal: 5,
          paddingVertical: 15,
          borderRadius: 20,
          backgroundColor: '#2F6BFF',
        }}
      >
        <HStack>
          <MaterialCommunityIcons
            name='bank'
            size={24}
            color='black'
            style={{
              marginHorizontal: 10,
            }}
          />
          <Heading>Accounts</Heading>
        </HStack>
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity
        onPress={() => router.push('/(stack)/settings')}
        style={{
          marginVertical: 5,
          paddingHorizontal: 5,
          paddingVertical: 15,
          borderRadius: 20,
          backgroundColor: '#6B7280',
        }}
      >
        <HStack>
          <Feather
            name='settings'
            size={24}
            color='black'
            style={{
              marginHorizontal: 10,
            }}
          />
          <Heading>Settings</Heading>
        </HStack>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default MoreScreen;
