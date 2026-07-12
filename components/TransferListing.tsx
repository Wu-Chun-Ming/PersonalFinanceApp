import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

// Gluestack UI
import { HStack } from './ui/hstack';
import { VStack } from './ui/vstack';

// Custom import
import styles from '@/app/styles';
import { AccountProps, TransferProps } from '@/types';

interface TransferListingProps {
  data: TransferProps[];
  accounts: AccountProps[];
}

const TransferListing = ({ data, accounts }: TransferListingProps) => {
  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: 'white',
        }}
      >
        <VStack>
          {data.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.navigate(`/transfer/${item.id}`)}
                style={{
                  backgroundColor: index % 2 === 0 ? '#D1D5DB' : '#9CA3AF',
                }}
              >
                <HStack
                  key={index}
                  className='justify-between'
                  style={{
                    margin: 20,
                  }}
                >
                  <VStack
                    style={{
                      width: '50%',
                    }}
                  >
                    {/* Date */}
                    <View>
                      <Text style={styles.text}>
                        {item.date && dayjs(item.date).format('YYYY-MM-DD')}
                      </Text>
                    </View>

                    {/* From Account */}
                    <View>
                      <Text style={styles.text}>
                        From:{' '}
                        {accounts.find((acc) => acc.id === item.fromAccountId)
                          ?.name || item.fromAccountId}
                      </Text>
                    </View>

                    <MaterialCommunityIcons
                      name='arrow-down-bold'
                      size={24}
                      color='black'
                    />

                    {/* To Account */}
                    <View>
                      <Text style={styles.text}>
                        To:{' '}
                        {accounts.find((acc) => acc.id === item.toAccountId)
                          ?.name || item.toAccountId}
                      </Text>
                    </View>

                    {/* Description */}
                    <View
                      style={{
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text style={styles.text}>{item.description}</Text>
                    </View>
                  </VStack>

                  {/* Currency */}
                  <View
                    style={[
                      styles.centered,
                      {
                        width: '20%',
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text style={styles.text}>{item.currency}</Text>
                  </View>

                  {/* Amount */}
                  <View
                    style={[
                      styles.centered,
                      {
                        width: '30%',
                        borderRadius: 8,
                      },
                    ]}
                  >
                    <Text style={styles.text}>
                      {Number(item.amount).toFixed(2)}
                    </Text>
                  </View>
                </HStack>
              </TouchableOpacity>
            );
          })}
        </VStack>
      </ScrollView>
    </>
  );
};

export default TransferListing;
