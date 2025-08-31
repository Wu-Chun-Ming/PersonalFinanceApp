import dayjs from 'dayjs';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

// Gluestack UI
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import QueryState from '@/components/QueryState';
import { CATEGORY_COLORS, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurringFrequency, TransactionType } from '@/constants/Types';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useTransactions } from '@/hooks/useTransactions';

const TransactionListScreen = () => {
    // Filters
    const {
        date,
        type,
        category,
        amount,
        recurring,
        frequency,
    } = useLocalSearchParams();
    // Transactions Data
    const {
        data: transactions,
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useTransactions();

    // Validation Schema
    const validationSchema = Yup.object().shape({
        date: Yup.date()
            .optional(),
        type: Yup.string()
            .oneOf(Object.values(TransactionType))
            .optional(),
        category: Yup.string()
            .when('type', (transactionType: any, schema) => {
                if (transactionType === TransactionType.EXPENSE) {
                    return schema
                        .oneOf(EXPENSE_CATEGORIES, 'Invalid Category')
                        .optional();
                }
                if (transactionType === TransactionType.INCOME) {
                    return schema
                        .oneOf(INCOME_CATEGORIES, 'Invalid Category')
                        .optional();
                }
                return schema.optional();
            }),
        amount: Yup.number()
            .typeError("Must be a number")
            .positive('Amount must be positive')
            .optional(),
        recurring: Yup.boolean()
            .optional(),
        frequency: Yup.string()
            .oneOf(Object.values(RecurringFrequency))
            .optional(),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            date: date || '',
            type: type || '',
            category: category || '',
            amount: amount || '',
            recurring: recurring || '',
            frequency: frequency || '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            setFilteredTransactions(useFilteredTransactions(transactions ?? [], values));
        },
    });

    const [filteredTransactions, setFilteredTransactions] = useState(useFilteredTransactions(transactions ?? [], formik.values));

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='transactions'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <ScrollView style={{ flex: 1 }}>
            <VStack>
                {transactions && (filteredTransactions)
                    .map((item, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => router.navigate(`/transaction/${item.id}` as Href)}
                                style={{
                                    backgroundColor: CATEGORY_COLORS[item.category],
                                }}
                            >
                                <HStack
                                    key={index}
                                    className='justify-between'
                                    style={{
                                        marginHorizontal: 20,
                                        marginVertical: 20,
                                    }}
                                >
                                    <VStack
                                        style={{
                                            width: '30%',
                                        }}
                                    >
                                        <View>
                                            <Text style={styles.text}>{(item.date && dayjs(item.date).format('YYYY-MM-DD')) || (item.recurring_frequency && JSON.parse(item.recurring_frequency.toString()).frequency)}</Text>
                                        </View>
                                        <View
                                            style={{
                                                alignSelf: 'flex-start',
                                            }}>
                                            <Text style={styles.text}>{item.description}</Text>
                                        </View>
                                    </VStack>

                                    <View style={[styles.centered, {
                                        borderRadius: 8,
                                        padding: 10,
                                    }]}>
                                        <Text style={styles.text}>{item.category}</Text>
                                    </View>

                                    <View
                                        style={[styles.centered, {
                                            width: '30%',
                                            backgroundColor: TRANSACTION_TYPE_COLORS[item.type],
                                            borderRadius: 8,
                                        }]}
                                    >
                                        <Text style={styles.text}>{item.type === TransactionType.EXPENSE ? '-' : '+'} RM {item.amount.toFixed(2)}</Text>
                                    </View>
                                </HStack>
                            </TouchableOpacity>
                        );
                    })}
            </VStack>
        </ScrollView>
    );
};

export default TransactionListScreen;
