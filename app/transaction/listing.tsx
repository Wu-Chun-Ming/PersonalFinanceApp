import dayjs from 'dayjs';
import { Href, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

// Gluestack UI
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { ScanContext } from '@/app/transaction/_layout';
import QueryState from '@/components/QueryState';
import { CATEGORY_COLORS, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurringFrequency, TransactionType } from '@/constants/Types';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { useTransactions } from '@/hooks/useTransactions';

const TransactionListScreen = () => {
    const navigation = useNavigation();
    // Filters
    const {
        date,
        type,
        category,
        amount,
        recurring,
        frequency,
    } = useLocalSearchParams();
    const context = useContext(ScanContext);
    const scannedData = context?.scannedData;
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
            setFilteredTransactions(useFilteredTransactions(transactions ?? [], {
                date: values.date ? new Date(values.date) : undefined,
                type: values.type ? values.type as TransactionType : undefined,
                category: values.category ? values.category as (typeof EXPENSE_CATEGORIES[number] | typeof INCOME_CATEGORIES[number]) : undefined,
                recurring: values.recurring ? (values.recurring === 'true' ? true : false) : undefined,
            }));
        }
    });

    const [filteredTransactions, setFilteredTransactions] = useState(useFilteredTransactions(transactions ?? [], {
        date: formik.values.date ? new Date(formik.values.date) : undefined,
        type: formik.values.type ? formik.values.type as TransactionType : undefined,
        category: formik.values.category ? formik.values.category as (typeof EXPENSE_CATEGORIES[number] | typeof INCOME_CATEGORIES[number]) : undefined,
        recurring: formik.values.recurring ? (formik.values.recurring === 'true' ? true : false) : undefined,
    }));

    useEffect(() => {
        if (scannedData && scannedData.length > 0) {
            navigation.setOptions({
                title: 'Pending Transactions',
            });
        }
    }, [scannedData]);

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
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#25292e',
        }} edges={['bottom']}>
            <ScrollView style={{
                flex: 1,
                backgroundColor: '#fff',
            }}>
                <VStack>
                    {transactions && ((scannedData && scannedData.length > 0 ? scannedData : filteredTransactions))
                        .map((item, index) => {
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={(scannedData && scannedData.length > 0)
                                        ? () => router.navigate(`/transaction/new?scanNum=${index}` as Href)
                                        : () => router.navigate(`/transaction/${item.id}`)
                                    }
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
                                                width: (scannedData && scannedData.length > 0 ? '60%' : '30%'),
                                            }}
                                        >
                                            <View>
                                                <Text style={styles.text}>{(item.date && dayjs(item.date).format('YYYY-MM-DD')) || (item.recurring_frequency && item.recurring_frequency.frequency)}</Text>
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
        </SafeAreaView>
    );
};

export default TransactionListScreen;
