import DateTimePicker from '@react-native-community/datetimepicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';

// Gluestack UI
import FormGroup from '@/components/FormGroup';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import { GOALS_COLOR } from '@/constants/Colors';
import { IncomeGoalProps, SavingsGoalProps } from '@/constants/Types';
import { editGoal, fetchGoal } from '@/db/goals';
import useShowToast from '@/hooks/useShowToast';

const GoalSettingsScreen = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);

    const {
        data: goals,
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useQuery({
        queryKey: ['goals'],
        queryFn: async () => {
            try {
                return {
                    savings: await fetchGoal('savings'),
                    income: await fetchGoal('income'),
                }
            } catch (error) {
                console.error(error);
                return {
                    savings: {
                        date: new Date(),
                        amount: 0,
                    },
                    income: {
                        perDay: 0,
                        perMonth: 0,
                        perYear: 0,
                    },
                };
            }
        }
    });

    // Define mutation for update goal
    const updateMutation = useMutation({
        mutationFn: (updatedGoalsData: { savings: SavingsGoalProps, income: IncomeGoalProps }) => editGoal(updatedGoalsData),
        onSuccess: (response) => {
            const { success, messages } = response.data;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['goals'] });
                refetch(); // Refetch the goals data to get the latest changes
            }
        },
    });

    // Validation Schema
    const validationSchema = Yup.object().shape({
        savings: Yup.object().shape({
            date: Yup.date()
                .optional()
                .test('date-or-amount', 'Date is required for savings goal', function (value) {
                    const { amount } = this.parent;
                    // If amount exists, date must be provided
                    return !amount || (amount && value);
                }),
            amount: Yup.number()
                .typeError('Amount must be a number')
                .min(0, 'Minimum amount is 0')
                .optional()
                .test('amount-or-date', 'Amount is required for savings goal', function (value) {
                    const { date } = this.parent;
                    // If date exists, amount must be provided
                    return !date || (date && value);
                }),
        }),
        income: Yup.object().shape({
            perDay: Yup.number()
                .typeError('Must be a number')
                .min(0, 'Minimum amount is 0')
                .optional(),
            perMonth: Yup.number()
                .typeError('Must be a number')
                .min(0, 'Minimum amount is 0')
                .optional(),
            perYear: Yup.number()
                .typeError('Must be a number')
                .min(0, 'Minimum amount is 0')
                .optional(),
        }),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            savings: {
                date: dayjs(goals?.savings.date) || '',
                amount: goals?.savings.amount || '',
            },
            income: {
                perDay: goals?.income.perDay || '',
                perMonth: goals?.income.perMonth || '',
                perYear: goals?.income.perYear || '',
            }
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const transformedGoalsData = {
                savings: {
                    date: values.savings.date,
                    amount: Number(values.savings.amount),
                },
                income: {
                    perDay: Number(values.income.perDay),
                    perMonth: Number(values.income.perMonth),
                    perYear: Number(values.income.perYear),
                },
            };

            updateMutation.mutate(transformedGoalsData);
        },
    });

    // If still loading or refetching
    if (isLoading || isRefetching) {
        return (
            <View style={styles.centeredFlex}>
                <ActivityIndicator size={80} color="#0000ff" />
            </View>
        );
    }
    // If error occurs
    if (isError || isRefetchError) {
        return (
            <View style={styles.centeredFlex}>
                <Text style={{ color: 'red' }}>Error loading data</Text>
                <Button onPress={() => {
                    queryClient.invalidateQueries({ queryKey: ['goals', goals] });
                    refetch(); // Refetch the goals data
                }}>
                    <ButtonText>Try again</ButtonText>
                </Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Savings Goal Label */}
            <View style={{
                margin: 10,
            }}>
                <View style={{
                    padding: 20,
                    backgroundColor: GOALS_COLOR['savings'],
                    borderRadius: 20,
                }}>
                    <Heading style={{
                        color: 'white',
                        textDecorationLine: 'underline',
                    }}>
                        Savings Goal
                    </Heading>
                </View>
            </View>

            <VStack className="px-4">
                {/* Date */}
                <FormGroup
                    label='Date'
                    isInvalid={formik.errors.savings?.date && formik.touched.savings?.date}
                    errorText={formik.errors.savings?.date}
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
                                value={dayjs((formik.values.savings.date).toString()).format('YYYY-MM-DD')}
                                placeholder='YYYY-MM-DD'
                                inputMode='text'
                            />
                        </TouchableOpacity>
                    </Input>
                </FormGroup>

                {dateModalVisible && <DateTimePicker
                    minimumDate={new Date()}
                    value={new Date((formik.values.savings.date).toString())}
                    mode='date'
                    onChange={(_event, selectedDate) => {
                        if (selectedDate) {
                            formik.setFieldValue('savings.date', dayjs(selectedDate).format('YYYY-MM-DD'));
                            setDateModalVisible(false);
                        }
                    }}
                />}

                {/* Savings Amount */}
                <FormGroup
                    label='Amount'
                    isInvalid={formik.errors.savings?.amount && formik.touched.savings?.amount}
                    errorText={formik.errors.savings?.amount}
                >
                    <Input className="text-center">
                        <InputField
                            type="text"
                            value={formik.values.savings?.amount.toString()}
                            onChangeText={formik.handleChange('savings.amount')}
                            placeholder='Enter Amount'
                            inputMode='numeric'
                        />
                    </Input>
                </FormGroup>
            </VStack>

            {/* Income Goal */}
            <View style={{
                margin: 10,
            }}>
                <View style={{
                    padding: 20,
                    backgroundColor: GOALS_COLOR['income'],
                    borderRadius: 20,
                }}>
                    <Heading style={{
                        textDecorationLine: 'underline',
                    }}>
                        Income Goal
                    </Heading>
                </View>
            </View>

            <VStack className="px-4">
                {/* Income Per Day */}
                <FormGroup
                    label='Per Day'
                    isInvalid={formik.errors.income?.perDay && formik.touched.income?.perDay}
                    errorText={formik.errors.income?.perDay}
                >
                    <Input className="text-center">
                        <InputField
                            type="text"
                            value={formik.values.income?.perDay.toString()}
                            onChangeText={formik.handleChange('income.perDay')}
                            placeholder='Enter Amount'
                            inputMode='numeric'
                        />
                    </Input>
                </FormGroup>

                {/* Income Per Month */}
                <FormGroup
                    label='Per Month'
                    isInvalid={formik.errors.income?.perMonth && formik.touched.income?.perMonth}
                    errorText={formik.errors.income?.perMonth}
                >
                    <Input className="text-center">
                        <InputField
                            type="text"
                            value={formik.values.income?.perMonth.toString()}
                            onChangeText={formik.handleChange('income.perMonth')}
                            placeholder='Enter Amount'
                            inputMode='numeric'
                        />
                    </Input>
                </FormGroup>

                {/* Income Per Year */}
                <FormGroup
                    label='Per Year'
                    isInvalid={formik.errors.income?.perYear && formik.touched.income?.perYear}
                    errorText={formik.errors.income?.perYear}
                >
                    <Input className="text-center">
                        <InputField
                            type="text"
                            value={formik.values.income?.perYear.toString()}
                            onChangeText={formik.handleChange('income.perYear')}
                            placeholder='Enter Amount'
                            inputMode='numeric'
                        />
                    </Input>
                </FormGroup>
            </VStack>

            <View className='mt-4'>
                <Button
                    className="self-center"
                    size="lg"
                    onPress={() => formik.handleSubmit()}
                    action="positive"
                >
                    <ButtonText>Save</ButtonText>
                </Button>
            </View>

        </SafeAreaView >
    );
};

export default GoalSettingsScreen;
