import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import dayjs from 'dayjs';

// Gluestack UI
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

// Custom import
import styles from '@/app/styles';
import { CATEGORY_COLORS } from '@/constants/colors';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useTransactions } from '@/hooks/useTransactions';

const CustomDrawer = () => {
  const { data: transactions } = useTransactions();

  const reminders = useFilteredTransactions(transactions ?? [], {
    startDate: new Date(),
  });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 10,
      }}
      edges={['top']}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
        }}
      >
        Reminders
      </Text>
      <FlatList
        data={reminders.sort((a, b) => new Date(a.date) - new Date(b.date))}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.navigate(`/transaction/${item.id}`)}
          >
            <View
              style={{
                padding: 10,
                marginVertical: 10,
                borderRadius: 10,
                backgroundColor: CATEGORY_COLORS[item.category],
              }}
            >
              <HStack>
                <VStack className='flex-1 items-start'>
                  <Text style={[styles.text]}>
                    {dayjs(item.date).format('YYYY-MM-DD')}
                  </Text>
                  <Text style={[styles.text]}>{item.description}</Text>
                </VStack>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                  }}
                >
                  <Text style={styles.boldText}>RM {item.amount}</Text>
                </View>
              </HStack>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default CustomDrawer;
