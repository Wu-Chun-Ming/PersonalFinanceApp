import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Href, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

// Gluestack UI
import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from "@/components/ui/vstack";

// Custom import
import styles from '@/app/styles';
import FormGroup from '@/components/FormGroup';
import QueryState from '@/components/QueryState';
import SelectGroup from '@/components/SelectGroup';
import { TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionCategory, TransactionType } from '@/constants/Types';
import useShowToast from '@/hooks/useShowToast';
import { useCreateTransaction, useDeleteTransaction, useTransaction, useUpdateTransaction } from '@/hooks/useTransactions';

const TransactionManager = () => {
    const navigation = useNavigation();
    const showToast = useShowToast();       // Use the useShowToast hook (custom)
    const [formAction, setFormAction] = useState<"create" | "update" | "delete" | undefined>(undefined)
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);
    const { transactionId } = useLocalSearchParams();
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);
    const {
        data: transaction,
        isLoading,
        isError,
        isSuccess,
        isRefetching,
        isRefetchError,
        refetch
    } = useTransaction(Number(transactionId));
    const createMutation = useCreateTransaction();
    const updateMutation = useUpdateTransaction();
    const deleteMutation = useDeleteTransaction();

    // Validation Schema
    const validationSchema = Yup.object().shape({
        date: Yup.date()
            .required('Date is required'),
        type: Yup
            .mixed<TransactionType>().oneOf(Object.values(TransactionType))
            .required('Transaction type is required'),
        category: Yup.string()
            .oneOf((transactionType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES), 'Invalid Category')
            .required('Category is required'),
        amount: Yup.number().typeError("Must be a number")
            .positive('Amount must be positive')
            .required('Amount is required'),
        description: Yup.string()
            .required('Description is required'),
        recurring: Yup.boolean().nullable(),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            date: new Date().toString(),
            type: TransactionType.EXPENSE,
            category: '',
            amount: '',
            description: '',
            recurring: false,
            recurring_frequency: null,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const transformedTransactionData = {
                ...values,
                type: transactionType,
                category: values.category as TransactionCategory,
                amount: Number(values.amount),
                recurring_frequency: values.recurring_frequency ? JSON.parse(values.recurring_frequency) : null,
            };
            switch (formAction) {
                case 'create':
                    createMutation.mutate(transformedTransactionData);
                    break;
                case 'update':
                    updateMutation.mutate({
                        id: Number(transactionId),
                        updatedTransactionData: transformedTransactionData
                    });
                    break;
            }
        },
    });
    useEffect(() => {
        if (transaction) {
            setTransactionType(transaction.type);
        }
        // Set the title for the screen
        const isNewTransaction = !transactionId;
        navigation.setOptions({
            title: isNewTransaction ? 'Create New Transaction' : 'Edit Transaction',
        });

        // Show toast if transaction is not found
        if (!isNewTransaction && isSuccess && !transaction) {
            showToast({ action: 'info', messages: 'Transaction not found' });
        }
    }, [transaction]);

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='transaction'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <ScrollView style={{ flex: 1, }}>
            <VStack className="flex-1 p-4">
                {!transaction && <HStack
                    style={[styles.centeredFlex, {
                        flexDirection: 'row',
                        minHeight: '10%',
                    }]}
                >
                    <TouchableNativeFeedback onPress={() => setTransactionType(TransactionType.EXPENSE)}>
                        <View style={[styles.centered, {
                            minWidth: 120,
                            padding: 20,
                            marginHorizontal: 20,
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                            borderRadius: 20,
                            borderWidth: transactionType === TransactionType.EXPENSE ? 3 : 0,
                        },]}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                            }]}>Expense</Text>
                        </View>
                    </TouchableNativeFeedback>

                    <Divider
                        orientation="vertical"
                        className="mx-5 h-full bg-black"
                    />

                    <TouchableNativeFeedback onPress={() => setTransactionType(TransactionType.INCOME)}>
                        <View style={[styles.centered, {
                            minWidth: 120,
                            padding: 20,
                            marginHorizontal: 20,
                            backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.INCOME],
                            borderRadius: 20,
                            borderWidth: transactionType == TransactionType.INCOME ? 3 : 0,
                        }]}>
                            <Text style={[styles.text, {
                                fontWeight: 'bold',
                            }]}>Income</Text>
                        </View>
                    </TouchableNativeFeedback>
                </HStack>}
                {/* Date */}
                {!formik.values.recurring ? <FormGroup
                    label='Date'
                    isInvalid={formik.errors.date && formik.touched.date}
                    isRequired={true}
                    errorText={formik.errors.date}
                >
                    <Input
                        className="text-center"
                        isReadOnly={true}
                    >
                        <TouchableOpacity
                            onPress={() => setDateModalVisible(true)}
                        >
                            <InputField
                                type="text"
                                value={dayjs((formik.values.date)).format('YYYY-MM-DD')}
                                placeholder='YYYY-MM-DD'
                                inputMode='text'
                            />
                        </TouchableOpacity>
                    </Input>
                </FormGroup>
                    : <FormGroup
                        label='Recurring Frequency'
                        isInvalid={formik.errors.recurring_frequency && formik.touched.recurring_frequency}
                        isRequired={true}
                        errorText={formik.errors.recurring_frequency}
                    >
                    </FormGroup>}
                {dateModalVisible && <DateTimePicker
                    value={new Date((formik.values.date))}
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

                {/* Type */}
                {transaction && <FormGroup
                    label='Type'
                    isInvalid={formik.errors.type && formik.touched.type}
                    isRequired={true}
                    errorText={formik.errors.type}
                >
                    <SelectGroup
                        initialLabel={transaction.type[0].toUpperCase() + transaction.type.slice(1)}
                        selectedValue={formik.values.type}
                        onValueChange={(value) => {
                            setTransactionType(value as TransactionType);
                            formik.setFieldValue('type', value);
                        }}
                    >
                        {Object.values(TransactionType).map(
                            (label) => (
                                <SelectItem
                                    key={label}
                                    label={label[0].toUpperCase() + label.slice(1)}
                                    value={label}
                                />
                            )
                        )}
                    </SelectGroup>
                </FormGroup>}

                {/* Category */}
                <FormGroup
                    label='Category'
                    isInvalid={formik.errors.category && formik.touched.category}
                    isRequired={true}
                    errorText={formik.errors.category}
                >
                    <SelectGroup
                        initialLabel={formik.values.category ? formik.values.category[0].toUpperCase() + formik.values.category.slice(1) : ''}
                        selectedValue={formik.values.category}
                        onValueChange={formik.handleChange('category')}
                    >
                        {(transactionType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(
                            (label) => (
                                <SelectItem
                                    key={label}
                                    label={label[0].toUpperCase() + label.slice(1)}
                                    value={label}
                                />
                            )
                        )}
                    </SelectGroup>
                </FormGroup>

                {/* Amount */}
                <FormGroup
                    label='Amount (RM)'
                    isInvalid={formik.errors.amount && formik.touched.amount}
                    isRequired={true}
                    errorText={formik.errors.amount}
                >
                    <Input className="text-center">
                        <InputField
                            type="text"
                            value={formik.values.amount}
                            onChangeText={formik.handleChange('amount')}
                            placeholder='Enter Amount'
                            inputMode='numeric'
                        />
                    </Input>
                </FormGroup>

                {/* Description */}
                <FormGroup
                    label='Description'
                    isInvalid={formik.errors.description && formik.touched.description}
                    isRequired={true}
                    errorText={formik.errors.description}
                >
                    <Textarea>
                        <TextareaInput
                            value={formik.values.description}
                            placeholder="Enter Description"
                            onChangeText={formik.handleChange('description')}
                            style={{ textAlignVertical: 'top' }}
                            inputMode='text'
                        />
                    </Textarea>
                </FormGroup>

                {/* Icon Group */}
                {!transaction && <HStack className='my-4 justify-between'>
                    <TouchableNativeFeedback
                        onPress={() => {
                            formik.setValues({
                                ...formik.values,
                                recurring: !formik.values.recurring,
                            });
                        }}
                    >
                        <View
                            style={[styles.centered, {
                                height: 75,
                                width: 75,
                            }]}
                        >
                            {formik.values.recurring ? <MaterialCommunityIcons name="repeat" size={65} color="black" />
                                : <MaterialCommunityIcons name="repeat-off" size={65} color="black" />}
                        </View>
                    </TouchableNativeFeedback>
                    {transactionType === TransactionType.EXPENSE && (
                        <TouchableNativeFeedback
                            onPress={() => router.navigate('/transaction/scan' as Href)}
                        >
                            <View
                                style={[styles.centered, {
                                    height: 75,
                                    width: 75,
                                }]}
                            >
                                <MaterialCommunityIcons name="camera-outline" size={80} color="black" />
                            </View>
                        </TouchableNativeFeedback>)}
                </HStack>}

                {/* Button Group */}
                {transaction ? (
                    <HStack className='mt-4 justify-between'>
                        <Button
                            size="lg"
                            onPress={() => deleteMutation.mutate(Number(transaction.id))}
                            action="negative"
                        >
                            <ButtonText>Delete</ButtonText>
                        </Button>

                        <Button
                            size="lg"
                            onPress={() => {
                                setFormAction("update");
                                formik.handleSubmit();
                            }}
                            action="positive"
                        >
                            <ButtonText>Save</ButtonText>
                        </Button>
                    </HStack>
                ) : (
                    <View className='mt-4'>
                        <Button
                            className="self-center"
                            size="lg"
                            onPress={() => {
                                setFormAction('create');
                                formik.setFieldValue('type', transactionType)
                                formik.handleSubmit();
                            }}
                            action="positive"
                        >
                            <ButtonText>Create</ButtonText>
                        </Button>
                    </View>
                )}
            </VStack>
        </ScrollView >
    );
};

export default TransactionManager;
