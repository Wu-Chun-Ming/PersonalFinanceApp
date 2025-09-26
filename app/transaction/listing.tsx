import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Href, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

// Gluestack UI
import { Button } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { ScanContext } from '@/app/transaction/_layout';
import QueryState from '@/components/QueryState';
import { CATEGORY_COLORS, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurringFrequency, TransactionCategory, TransactionType } from '@/constants/Types';
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
    const [isFiltersCollapsed, setIsFiltersCollapsed] = useState<boolean>(true);
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
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
        }
    });

    const filteredTransactions = useFilteredTransactions(transactions ?? [], {
        date: formik.values.date ? new Date(formik.values.date) : undefined,
        type: formik.values.type ? formik.values.type as TransactionType : undefined,
        category: formik.values.category ? formik.values.category as (typeof EXPENSE_CATEGORIES[number] | typeof INCOME_CATEGORIES[number]) : undefined,
        amount: formik.values.amount ? Number(formik.values.amount) : undefined,
        recurring: formik.values.recurring ? (formik.values.recurring === 'true' ? true : false) : undefined,
        frequency: formik.values.frequency ? formik.values.frequency as RecurringFrequency : undefined,
    });

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
            {/* Button to toggle filter visibility */}
            {(scannedData && scannedData.length === 0) && <Button
                onPress={() => setIsFiltersCollapsed(prevState => !prevState)}
                style={{
                    margin: 5,
                    borderRadius: 8,
                    backgroundColor: '#595c62ff',
                }}
            >
                <Text style={[styles.text, {
                    color: 'white',
                }]}>
                    {isFiltersCollapsed ? 'Show Filters' : 'Hide Filters'}
                </Text>
            </Button>}

            {/* Date Picker Modal */}
            {dateModalVisible && <DateTimePicker
                value={formik.values.date ? new Date(formik.values.date) : new Date()}
                mode='date'
                onChange={(event, selectedDate) => {
                    if (event.type === 'set' && selectedDate) {
                        setDateModalVisible(false);
                        formik.setFieldValue('date', dayjs(selectedDate).format('YYYY-MM-DD'));
                    } else if (event.type === 'dismissed') {
                        setDateModalVisible(false);
                    }
                }}
            />}

            {/* Collapsible Filters Section */}
            <Collapsible collapsed={isFiltersCollapsed}>
                <VStack
                    style={{
                        backgroundColor: '#fff',
                    }}
                >
                    {/* Date & Type */}
                    <HStack style={{
                        margin: 5,
                    }}>
                        <HStack style={[{
                            width: '45%',
                            alignItems: 'center',
                            marginRight: '5%',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                                marginRight: 10,
                            }]}>Date:</Text>
                            <TouchableOpacity
                                onPress={() => setDateModalVisible(true)}
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text style={[styles.text, styles.centeredFlex]}>
                                    {formik.values.date ? dayjs(formik.values.date).format('YYYY-MM-DD') : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                        </HStack>

                        <HStack style={[{
                            width: '50%',
                            alignItems: 'center',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                                marginRight: 10,
                            }]}>Type:</Text>
                            <Dropdown
                                data={[
                                    { label: 'All', value: '' },
                                    ...Object.values(TransactionType).map((type) => ({
                                        label: type.charAt(0).toUpperCase() + type.slice(1),
                                        value: type,
                                    }))
                                ]}
                                placeholder='...'
                                placeholderStyle={{
                                    textAlign: 'center',
                                }}
                                labelField="label"
                                valueField="value"
                                value={formik.values.type.toString()}
                                onChange={(item) => formik.setFieldValue('type', item.value)}
                                style={{
                                    flex: 1,
                                }}
                                selectedTextStyle={{
                                    textAlign: 'center',
                                }}
                                itemTextStyle={[styles.text, {
                                    textAlign: 'center',
                                }]}
                            />
                        </HStack>
                    </HStack>

                    {/* Category */}
                    <HStack
                        style={[{
                            margin: 5,
                            alignItems: 'center',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}
                    >
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            marginRight: 10,
                        }]}>Category:</Text>
                        <Dropdown
                            data={[
                                { label: '-', value: '' },
                                ...Object.values(TransactionCategory).map((type) => ({
                                    label: type.charAt(0).toUpperCase() + type.slice(1),
                                    value: type,
                                }))
                            ]}
                            placeholder='Select category'
                            placeholderStyle={{
                                textAlign: 'center',
                            }}
                            labelField="label"
                            valueField="value"
                            value={formik.values.category.toString()}
                            onChange={(item) => formik.setFieldValue('category', item.value)}
                            style={[{
                                flex: 1,
                            }]}
                            selectedTextStyle={{
                                textAlign: 'center',
                            }}
                            itemTextStyle={[styles.text, {
                                textAlign: 'center',
                            }]}
                        />
                    </HStack>

                    {/* Amount */}
                    <HStack style={[{
                        margin: 5,
                        alignItems: 'center',
                        padding: 10,
                        backgroundColor: '#d8e0e6ff',
                        borderRadius: 10,
                    }]}>
                        <Text style={[styles.text, {
                            fontWeight: 'bold',
                            marginRight: 10,
                        }]}>Amount:</Text>
                        <TextInput
                            style={[styles.text, styles.centeredFlex]}
                            keyboardType="numeric"
                            placeholder="Enter amount"
                            value={formik.values.amount.toString()}
                            onChangeText={(value) => formik.setFieldValue('amount', value)}
                        />
                    </HStack>

                    {/* Recurring & Frequency */}
                    <HStack style={{
                        margin: 5,
                        justifyContent: 'space-between',
                    }}>
                        <HStack style={[{
                            width: '45%',
                            marginRight: 10,
                            alignItems: 'center',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text
                                style={[styles.text, {
                                    fontWeight: 'bold',
                                    marginRight: 10,
                                }]}
                            >Recurring:</Text>
                            <Dropdown
                                data={[
                                    { label: '-', value: '' },
                                    { label: 'Yes', value: 'true' },
                                    { label: 'No', value: 'false' },
                                ]}
                                placeholder='-'
                                placeholderStyle={{
                                    textAlign: 'center',
                                }}
                                labelField="label"
                                valueField="value"
                                value={formik.values.recurring.toString()}
                                onChange={(item) => formik.setFieldValue('recurring', item.value)}
                                style={[{
                                    flex: 1,
                                }]}
                                selectedTextStyle={{
                                    textAlign: 'center',
                                }}
                                itemTextStyle={[styles.text, {
                                    textAlign: 'center',
                                }]}
                            />
                        </HStack>
                        <HStack
                            style={[{
                                flex: 1,
                                alignItems: 'center',
                                padding: 10,
                                backgroundColor: '#d8e0e6ff',
                                borderRadius: 10,
                            }]}
                        >
                            <Text
                                style={[styles.text, {
                                    fontWeight: 'bold',
                                    marginRight: 10,
                                }]}
                            >Frequency:</Text>
                            <Dropdown
                                data={[
                                    { label: '-', value: '' },
                                    ...Object.values(RecurringFrequency).map((frequency) => ({
                                        label: frequency.charAt(0).toUpperCase() + frequency.slice(1),
                                        value: frequency,
                                    }))
                                ]}
                                placeholder='-'
                                placeholderStyle={{
                                    textAlign: 'center',
                                }}
                                labelField="label"
                                valueField="value"
                                value={formik.values.frequency.toString()}
                                onChange={(item) => formik.setFieldValue('frequency', item.value)}
                                style={[{
                                    flex: 1,
                                }]}
                                selectedTextStyle={{
                                    textAlign: 'center',
                                }}
                                itemTextStyle={[styles.text, {
                                    textAlign: 'center',
                                }]}
                            />
                        </HStack>
                    </HStack>
                    {/* Reset Filters Button */}
                    {formik.values && <Button
                        onPress={() => {
                            formik.resetForm({
                                values: {
                                    date: '',
                                    type: '',
                                    category: '',
                                    amount: '',
                                    recurring: '',
                                    frequency: '',
                                }
                            });
                        }}
                        style={{
                            margin: 5,
                            borderRadius: 10,
                            backgroundColor: 'red',
                        }}
                    >
                        <Text style={[styles.text, {
                            color: 'white',
                            fontWeight: 'bold',
                        }]}>Reset Filters</Text>
                    </Button>}
                </VStack>
            </Collapsible>

            {/* Transactions List */}
            <ScrollView style={{
                flex: 1,
                backgroundColor: '#fff',
            }}>
                <VStack>
                    {filteredTransactions && ((scannedData && scannedData.length > 0)
                        ? scannedData
                        : filteredTransactions
                    ).map((item, index) => {
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
                                            width: '30%',
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
