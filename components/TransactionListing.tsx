import dayjs from "dayjs";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// Gluestack UI
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

// Custom import
import styles from "@/app/styles";
import {
    CATEGORY_COLORS,
    TRANSACTION_TYPE_COLORS,
} from "@/constants/colors";
import { TransactionFormikProps } from "@/hooks/useTransactionsFormik";
import {
    TransactionCategoryType,
    TransactionProps,
    TransactionType,
} from "@/types";

interface TransactionListingProps {
    data: TransactionProps[] | TransactionFormikProps[];
    isFromScan?: boolean;
}

const TransactionListing = ({
    data,
    isFromScan = false,
}: TransactionListingProps) => {
    return (
        <>
            <ScrollView style={{
                flex: 1,
                backgroundColor: 'white',
            }}>
                <VStack>
                    {data.map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() =>
                                    router.navigate(
                                        isFromScan
                                            ? `/transaction/new?scanNum=${index}`
                                            : `/transaction/${item.id}`
                                    )
                                }
                                style={{
                                    backgroundColor: CATEGORY_COLORS[item.category as TransactionCategoryType],
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
                                            width: '30%',
                                        }}
                                    >
                                        {/* Date/Frequency */}
                                        <View>
                                            <Text style={styles.text}>
                                                {(item.date && dayjs(item.date).format('YYYY-MM-DD'))
                                                    || (item.recurring_frequency && item.recurring_frequency.frequency)}
                                            </Text>
                                        </View>
                                        {/* Description */}
                                        <View
                                            style={{
                                                alignSelf: 'flex-start',
                                            }}>
                                            <Text style={styles.text}>{item.description}</Text>
                                        </View>
                                    </VStack>

                                    {/* Category */}
                                    <View style={[styles.centered, {
                                        padding: 10,
                                    }]}>
                                        <Text style={styles.text}>{item.category}</Text>
                                    </View>

                                    {/* Amount */}
                                    <View
                                        style={[styles.centered, {
                                            width: '30%',
                                            backgroundColor: TRANSACTION_TYPE_COLORS[item.type],
                                            borderRadius: 8,
                                        }]}
                                    >
                                        <Text style={styles.text}>
                                            {item.type === TransactionType.EXPENSE ? '-' : '+'} RM {Number(item.amount).toFixed(2)}
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
}

export default TransactionListing;