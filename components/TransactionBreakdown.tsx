import styles from "@/app/styles";
import { CATEGORY_COLORS } from "@/constants/Colors";
import { router } from "expo-router";
import { Text, TouchableNativeFeedback, View } from "react-native";
import { Box } from "./ui/box";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

interface TransactionBreakdownProps {
    data: { category: keyof typeof CATEGORY_COLORS; total: number; percentage: number }[];
    type: 'expense' | 'income';
}

const TransactionBreakdown = ({
    data,
    type,
}: TransactionBreakdownProps) => {
    return (
        <VStack>
            {data.map((item, index) => {
                if (item.total !== 0) {
                    return (
                        <HStack
                            key={index}
                            className='justify-between items-center mx-5 my-2'
                        >
                            {/* Color Box */}
                            <Box className="w-5 h-5 rounded"
                                style={{
                                    backgroundColor: CATEGORY_COLORS[item.category],
                                }}
                            />
                            <TouchableNativeFeedback
                                onPress={() => router.navigate(`/transaction/listing?type=${type}&category=${item.category}&recurring=false`)}
                            >
                                {/* Category Label */}
                                <View style={[styles.centered, {
                                    width: '40%',
                                    padding: 5,
                                    borderRadius: 10,
                                    backgroundColor: CATEGORY_COLORS[item.category],
                                }]}>
                                    <Text style={styles.text}>{item.category}</Text>
                                </View>
                            </TouchableNativeFeedback>

                            {/* Currency Label */}
                            <Text style={styles.text}>RM</Text>

                            {/* Total Amount and Percentage */}
                            <View style={{
                                width: '30%',
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                            }}>
                                <Text style={styles.text}>{item.total.toFixed(2)}</Text>
                                <Text>({item.percentage.toFixed(2)}%)</Text>
                            </View>
                        </HStack>
                    );
                }
            })}
        </VStack>
    );
};

export default TransactionBreakdown;