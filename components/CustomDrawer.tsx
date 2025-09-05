import dayjs from 'dayjs';
import { router } from 'expo-router';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Gluestack UI
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { CATEGORY_COLORS } from '@/constants/Colors';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useTransactions } from '@/hooks/useTransactions';

const CustomDrawer = () => {
  const {
    data: transactions,
  } = useTransactions();

  const reminders = useFilteredTransactions(transactions ?? [], {
    startDate: new Date(),
  })

  return (
    <SafeAreaView style={{
      flex: 1,
      padding: 10,
    }} edges={['top']}>
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
      }}>
        Reminders
      </Text>
      <FlatList
        data={reminders.sort((a, b) => new Date(a.date) - new Date(b.date))}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.navigate(`/transaction/${item.id}`)}>
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
                  <Text style={[styles.text]}>{dayjs(item.date).format('YYYY-MM-DD')}</Text>
                  <Text style={[styles.text]}>{item.description}</Text>
                </VStack>
                <View style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                }}>
                  <Text style={[styles.text, {
                    fontWeight: 'bold',
                  }]}>RM {item.amount}</Text>
                </View>
              </HStack>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

export default CustomDrawer;
