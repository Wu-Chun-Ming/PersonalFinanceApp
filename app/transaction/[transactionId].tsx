import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Href, router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useFormik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { ScanContext } from '@/app/transaction/_layout';
import FormGroup from '@/components/FormGroup';
import QueryState from '@/components/QueryState';
import SelectGroup from '@/components/SelectGroup';
import { TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurringDay, RecurringFrequency, TransactionCategory, TransactionType } from '@/constants/Types';
import useShowToast from '@/hooks/useShowToast';
import { useCreateTransaction, useDeleteTransaction, useTransaction, useUpdateTransaction } from '@/hooks/useTransactions';

const TransactionManager = () => {
    const { scannedData } = useContext(ScanContext);
    const { scanNum = 0 } = useLocalSearchParams();
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
            .when(['recurring'], ([recurring], schema) => {
                return recurring === false
                    ? schema.required('Date is required')
                    : schema.notRequired();
            }),
        type: Yup.string()
            .oneOf(Object.values(TransactionType), 'Invalid type')
            .required('Transaction type is required'),
        category: Yup.string()
            .oneOf((transactionType === TransactionType.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES), 'Invalid Category')
            .required('Category is required'),
        amount: Yup.number().typeError("Must be a number")
            .positive('Amount must be positive')
            .required('Amount is required'),
        description: Yup.string()
            .required('Description is required'),
        recurring: Yup.boolean(),
        recurring_frequency: Yup.object().shape({
            frequency: Yup.string()
                .oneOf(Object.values(RecurringFrequency), 'Invalid frequency')
                .when('$recurring', ([recurring], schema) => {
                    return recurring === true
                        ? schema.required('Frequency is required')
                        : schema.notRequired();
                }),
            time: Yup.object().shape({
                month: Yup.string()
                    .when('$recurring_frequency.frequency', ([frequency], schema) => {
                        return (frequency === RecurringFrequency.YEARLY)
                            ? schema.required('Month is required')
                            : schema.notRequired();
                    }),
                date: Yup.string(),
                day: Yup.string()
                    .oneOf(Object.values(RecurringDay), 'Invalid day')
                    .when('$recurring_frequency.frequency', ([frequency], schema) => {
                        return frequency === RecurringFrequency.WEEKLY
                            ? schema.required('Day is required')
                            : schema.notRequired();
                    }),
            }).test(
                'monthly-day-or-date',
                'Either day or date must be provided',
                function (value) {
                    const frequency = this.options.context?.recurring_frequency?.frequency;
                    if (frequency === RecurringFrequency.MONTHLY) {
                        return !!(value?.day || value?.date);
                    }
                    return true;
                }
            ),
        })
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
            recurring_frequency: {
                frequency: '',
                time: {
                    month: '',
                    date: '',
                    day: '',
                },
            },
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const transformedTransactionData = {
                ...values,
                date: !values.recurring ? new Date(values.date) : null,
                type: transactionType,
                category: values.category as TransactionCategory,
                amount: Number(values.amount),
                recurring_frequency: values.recurring
                    ? {
                        frequency: values.recurring_frequency.frequency as RecurringFrequency,
                        time: {
                            month: Number(values.recurring_frequency.time.month) || null,
                            date: Number(values.recurring_frequency.time.date) || null,
                            day: values.recurring_frequency.time.day as RecurringDay || null,
                        },
                    } : null,
            };
            switch (formAction) {
                case 'create':
                    createMutation.mutate(transformedTransactionData);
                    // Remove current scanned data from pending transactions
                    if (scannedData && scannedData[scanNum]) {
                        scannedData.splice(scanNum, 1);
                        if (scannedData.length == 0) {
                            router.dismiss(1);
                            router.replace('/');
                        }
                    }
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
            // Set the current transaction type
            setTransactionType(transaction.type);
            // Set the formik values
            formik.setValues({
                date: transaction.date ? transaction.date.toString() : '',
                type: transaction.type,
                category: transaction.category,
                amount: transaction.amount.toString(),
                description: transaction.description,
                recurring: transaction.recurring,
                recurring_frequency: transaction.recurring_frequency ?
                    {
                        frequency: transaction.recurring_frequency.frequency,
                        time: {
                            month: transaction.recurring_frequency.time.month?.toString() ?? '',
                            day: transaction.recurring_frequency.time.day ?? '',
                            date: transaction.recurring_frequency.time.date?.toString() ?? '',
                        },
                    } : {
                        frequency: '',
                        time: {
                            month: '',
                            day: '',
                            date: '',
                        },
                    },
            });
        }
        // Set the title for the screen
        const isNewTransaction = (transactionId === 'new');
        navigation.setOptions({
            title: isNewTransaction ? 'Create New Transaction' : 'Edit Transaction',
        });

        // Show toast if transaction is not found
        if (!isNewTransaction && isSuccess && !transaction) {
            showToast({ action: 'info', messages: 'Transaction not found' });
        }
        // Fill in scanned data after scanning
        if (scannedData && scannedData.length > 0 && isNewTransaction) {
            formik.setValues({
                ...scannedData[scanNum],
                amount: scannedData[scanNum].amount.toString(),
            });
        }
    }, [transaction, scannedData]);

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
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#25292e',
        }} edges={['bottom']}>
            <ScrollView style={{
                flex: 1,
                backgroundColor: '#fff',
            }}>
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
                        // Recurring Frequency
                        : <>
                            <FormGroup
                                label='Recurring Frequency'
                                isInvalid={
                                    (formik.errors.recurring_frequency?.frequency && formik.touched.recurring_frequency?.frequency)
                                    || ((typeof formik.errors.recurring_frequency?.time === 'string' ? formik.errors.recurring_frequency?.time : undefined) && formik.touched.recurring_frequency?.time)
                                }
                                isRequired={true}
                                errorText={formik.errors.recurring_frequency?.frequency || (typeof formik.errors.recurring_frequency?.time === 'string' ? formik.errors.recurring_frequency?.time : undefined)}
                            >
                                <SelectGroup
                                    initialLabel={formik.values.recurring_frequency.frequency ? formik.values.recurring_frequency.frequency[0].toUpperCase() + formik.values.recurring_frequency.frequency.slice(1) : ''}
                                    selectedValue={formik.values.recurring_frequency.frequency}
                                    onValueChange={formik.handleChange('recurring_frequency.frequency')}
                                    placeholder="Select frequency"
                                >
                                    {(Object.values(RecurringFrequency)).map(
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

                            <HStack>
                                {/* Recurring Day/Month */}
                                <FormGroup
                                    isInvalid={
                                        formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY
                                            ? formik.errors.recurring_frequency?.time?.month && formik.touched.recurring_frequency?.time?.month
                                            : formik.errors.recurring_frequency?.time?.day && formik.touched.recurring_frequency?.time?.day
                                    }
                                    errorText={
                                        formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY
                                            ? formik.errors.recurring_frequency?.time?.month
                                            : formik.errors.recurring_frequency?.time?.day
                                    }
                                    style={{
                                        width: '50%',
                                    }}
                                >
                                    <SelectGroup
                                        initialLabel={
                                            ((
                                                formik.values.recurring_frequency.frequency === RecurringFrequency.MONTHLY
                                                || formik.values.recurring_frequency.frequency === RecurringFrequency.WEEKLY
                                            ) && (
                                                    formik.values.recurring_frequency.time.day ? formik.values.recurring_frequency.time.day[0].toUpperCase() + formik.values.recurring_frequency.time.day.slice(1) : ''
                                                ) || (
                                                    formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY
                                                ) && (
                                                    formik.values.recurring_frequency.time.month ? formik.values.recurring_frequency.time.month[0].toUpperCase() + formik.values.recurring_frequency.time.month.slice(1) : ''
                                                ))
                                        }
                                        selectedValue={formik.values.recurring_frequency.time.day}
                                        onValueChange={
                                            formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY
                                                ? formik.handleChange('recurring_frequency.time.month')
                                                : formik.handleChange('recurring_frequency.time.day')
                                        }
                                        isDisabled={
                                            formik.values.recurring_frequency.frequency === ''
                                            || formik.values.recurring_frequency.frequency === RecurringFrequency.DAILY
                                        }
                                        placeholder={'Select ' + (formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY ? 'month' : 'day')}
                                    >
                                        {(
                                            ((
                                                formik.values.recurring_frequency.frequency === RecurringFrequency.MONTHLY
                                                || formik.values.recurring_frequency.frequency === RecurringFrequency.WEEKLY
                                            )
                                                && [['Monday', RecurringDay.MONDAY], ['Tuesday', RecurringDay.TUESDAY], ['Wednesday', RecurringDay.WEDNESDAY], ['Thursday', RecurringDay.THURSDAY], ['Friday', RecurringDay.FRIDAY], ['Saturday', RecurringDay.SATURDAY], ['Sunday', RecurringDay.SUNDAY]]
                                            )
                                            ||
                                            ((
                                                formik.values.recurring_frequency.frequency === RecurringFrequency.YEARLY
                                            )
                                                && [['January', 1], ['February', 2], ['March', 3], ['April', 4], ['May', 5], ['June', 6], ['July', 7], ['August', 8], ['September', 9], ['October', 10], ['November', 11], ['December', 12]]
                                            )
                                            || []
                                        ).map(
                                            (label) => (
                                                <SelectItem
                                                    key={label[1]}
                                                    label={label[0].toString()}
                                                    value={label[1].toString()}
                                                />
                                            )
                                        )}
                                    </SelectGroup>
                                </FormGroup>

                                {/* Recurring Date */}
                                <FormGroup
                                    isInvalid={formik.errors.recurring_frequency?.time?.date && formik.touched.recurring_frequency?.time?.date}
                                    errorText={formik.errors.recurring_frequency?.time?.date}
                                    style={{
                                        width: '50%',
                                    }}
                                >
                                    <SelectGroup
                                        initialLabel={formik.values.recurring_frequency.time.date
                                            ? `${formik.values.recurring_frequency.time.date}${[, "st", "nd", "rd"][Number(formik.values.recurring_frequency.time.date) % 10] &&
                                                ![11, 12, 13].includes(Number(formik.values.recurring_frequency.time.date))
                                                ? [, "st", "nd", "rd"][Number(formik.values.recurring_frequency.time.date) % 10]
                                                : "th"
                                            }`
                                            : ''
                                        }
                                        selectedValue={formik.values.recurring_frequency.time.date}
                                        onValueChange={formik.handleChange('recurring_frequency.time.date')}
                                        isDisabled={
                                            formik.values.recurring_frequency.frequency === ''
                                            || formik.values.recurring_frequency.frequency === RecurringFrequency.DAILY
                                            || formik.values.recurring_frequency.frequency === RecurringFrequency.WEEKLY
                                        }
                                        placeholder='Select date'
                                        scrollViewStyle={{ maxHeight: 200, overflow: 'scroll' }}
                                    >
                                        {(
                                            Array.from({ length: 31 }, (_, i) => [`${i + 1}${["st", "nd", "rd"][((i + 1) % 10) - 1] && ![11, 12, 13].includes(i + 1) ? ["st", "nd", "rd"][(i + 1) % 10 - 1] : "th"}`, i + 1])
                                        ).map(
                                            (label) => (
                                                <SelectItem
                                                    key={label[1]}
                                                    label={label[0].toString()}
                                                    value={label[1].toString()}
                                                />
                                            )
                                        )}
                                    </SelectGroup>
                                </FormGroup>
                            </HStack>
                        </>}
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
                            initialLabel={formik.values.type[0].toUpperCase() + formik.values.type.slice(1)}
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
                                    date: formik.values.date ? '' : new Date().toString(),
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
                        {transactionType === TransactionType.EXPENSE && !formik.values.recurring && (
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
            </ScrollView>
        </SafeAreaView>
    );
};

export default TransactionManager;
