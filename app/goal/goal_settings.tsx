import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { Text, TouchableNativeFeedback, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Gluestack UI
import FormGroup from '@/components/FormGroup';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import QueryState from '@/components/QueryState';
import { HStack } from '@/components/ui/hstack';
import { GOALS_COLOR } from '@/constants/Colors';
import { useGoals } from '@/hooks/useGoals';
import { useGoalsFormik } from '@/hooks/useGoalsFormik';
import useShowToast from '@/hooks/useShowToast';
import { resetGoal } from '@/services/goals';

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
    } = useGoals();
    const [savingsGoalExists, setSavingsGoalExists] = useState(false);
    const [incomeGoalExists, setIncomeGoalExists] = useState(false);

    const initialGoals = {
        savings: {
            date: goals?.savings.date ? dayjs(goals?.savings.date).format('YYYY-MM-DD') : '',
            amount: goals?.savings.amount ? goals?.savings.amount.toString() : '',
        },
        income: {
            perDay: goals?.income.perDay ? goals.income.perDay.toString() : '',
            perMonth: goals?.income.perMonth ? goals.income.perMonth.toString() : '',
            perYear: goals?.income.perYear ? goals.income.perYear.toString() : '',
        }
    }

    // Formik setup
    const formik = useGoalsFormik(initialGoals);

    useEffect(() => {
        setSavingsGoalExists((goals?.savings.date || goals?.savings.amount) ? true : false);
        setIncomeGoalExists((goals?.income.perDay || goals?.income.perMonth || goals?.income.perYear) ? true : false);
    }, [goals]);

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='goals'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <SafeAreaView style={{
            flex: 1,
            backgroundColor: '#25292e',
        }} edges={['bottom']}>
            <View style={{
                flex: 1,
                backgroundColor: '#fff'
            }}>
                {/* Savings Goal Label */}
                <View style={{
                    margin: 10,
                }}>
                    <View style={{
                        padding: 20,
                        backgroundColor: GOALS_COLOR['savings'],
                        borderRadius: 20,
                    }}>
                        <HStack className='justify-between items-center'>
                            <Heading style={{
                                color: 'white',
                                textDecorationLine: 'underline',
                            }}>
                                Savings Goal
                            </Heading>
                            {savingsGoalExists && <TouchableNativeFeedback
                                onPress={async () => {
                                    await resetGoal('savings');
                                    setSavingsGoalExists(false);
                                    formik.resetForm({
                                        values: {
                                            ...formik.values,
                                            savings: { date: '', amount: '' }
                                        }
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['goals'] });
                                    refetch();
                                    showToast({ action: 'success', messages: 'Savings goal has been reset' });
                                }}
                            >
                                <Text style={[styles.text, {
                                    backgroundColor: '#d01111ff',
                                    padding: 8,
                                    borderRadius: 10,
                                }]}>Reset</Text>
                            </TouchableNativeFeedback>}
                        </HStack>
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
                                    value={formik.values.savings.date}
                                    placeholder='YYYY-MM-DD'
                                    inputMode='text'
                                />
                            </TouchableOpacity>
                        </Input>
                    </FormGroup>

                    {dateModalVisible && <DateTimePicker
                        minimumDate={new Date()}
                        value={formik.values.savings.date ? new Date(formik.values.savings.date) : new Date()}
                        mode='date'
                        onChange={(event, selectedDate) => {
                            // If user selected date and pressed OK
                            if (event.type === 'set' && selectedDate) {
                                setDateModalVisible(false);
                                formik.setFieldValue('savings.date', dayjs(selectedDate).format('YYYY-MM-DD'));
                            } else if (event.type === 'dismissed') {
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
                                value={formik.values.savings?.amount}
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
                        <HStack className='justify-between items-center'>
                            <Heading style={{
                                textDecorationLine: 'underline',
                            }}>
                                Income Goal
                            </Heading>
                            {incomeGoalExists && <TouchableNativeFeedback
                                onPress={async () => {
                                    await resetGoal('income');
                                    setIncomeGoalExists(false);
                                    formik.resetForm({
                                        values: {
                                            ...formik.values,
                                            income: { perDay: '', perMonth: '', perYear: '' }
                                        }
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['goals'] });
                                    refetch();
                                    showToast({ action: 'success', messages: 'Income goal has been reset' });
                                }}
                            >
                                <Text style={[styles.text, {
                                    backgroundColor: '#d01111ff',
                                    padding: 8,
                                    borderRadius: 10,
                                }]}>Reset</Text>
                            </TouchableNativeFeedback>}
                        </HStack>
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
                                value={formik.values.income?.perDay}
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
                                value={formik.values.income?.perMonth}
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
                                value={formik.values.income?.perYear}
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
            </View>
        </SafeAreaView >
    );
};

export default GoalSettingsScreen;
