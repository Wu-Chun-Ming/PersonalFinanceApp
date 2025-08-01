import { useFont } from '@shopify/react-native-skia';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { BarGroup, CartesianChart } from 'victory-native';
import * as Yup from 'yup';

// Gluestack UI
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ChevronDownIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "@/components/ui/modal";
import {
    Select,
    SelectBackdrop,
    SelectContent,
    SelectDragIndicator,
    SelectDragIndicatorWrapper,
    SelectIcon,
    SelectInput,
    SelectItem,
    SelectPortal,
    SelectScrollView,
    SelectTrigger
} from "@/components/ui/select";
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import inter from "@/assets/inter-medium.ttf";
import FormGroup from '@/components/FormGroup';
import { BUDGET_COLOR, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { BudgetProps, EXPENSE_CATEGORIES, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';
import { editBudget, fetchBudgets } from '@/db/budgets';
import { fetchTransactions } from '@/db/transactions';
import useShowToast from '@/hooks/useShowToast';

const BudgetScreen = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();       // Use the useShowToast hook (custom)
    const font = useFont(inter, 12);
    const {
        data: budgets,
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useQuery({
        queryKey: ['budgets'],
        queryFn: async () => {
            try {
                return await fetchBudgets();
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    });
    const {
        data: transactions = [],
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
    } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => {
            try {
                return await fetchTransactions() as TransactionProps[];
            } catch (error) {
                console.error(error);
                return [];
            }
        }
    });
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);

    // Define mutation for update transaction
    const updateMutation = useMutation({
        mutationFn: ({ year, month, category, amount }: BudgetProps) => editBudget(amount, { year, month, category }),
        onSuccess: (response) => {
            const { success, messages } = response;
            const actionType = success ? 'success' : 'info';
            showToast({ action: actionType, messages: messages });
        },
        onError: (error) => {
            const error_message = error.message;
            showToast({ action: 'warning', messages: error_message });
        },
        onSettled: (_data, error) => {
            if (!error) {
                queryClient.invalidateQueries({ queryKey: ['budgets'] });
                refetch(); // Refetch the budgets data to get the latest changes
            }
        },
    });

    // Validation Schema
    const validationSchema = Yup.object().shape({
        year: Yup.string()
            .matches(/^\d{4}$/, 'Year must be a 4-digit number')
            .required('Year is required'),
        month: Yup.string()
            .matches(/^(0?[1-9]|1[0-2])$/, 'Month must be a number between 1 and 12')
            .required('Month is required'),
        category: Yup.string()
            .oneOf(EXPENSE_CATEGORIES, 'Invalid Category')
            .required('Category is required'),
        amount: Yup.number().typeError("Must be a number")
            .positive('Amount must be positive')
            .required('Amount is required'),
    });

    // Formik setup
    const formik = useFormik({
        initialValues: {
            year: (new Date().getFullYear()).toString(),
            month: (new Date().getMonth() + 1).toString(),
            category: '',
            amount: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            updateMutation.mutate({
                year: Number(values.year),
                month: Number(values.month),
                category: values.category as TransactionCategory,
                amount: Number(values.amount),
            });
        }
    });

    // Filter expenses from transactions
    const expenses = transactions ? transactions.filter(transaction => transaction.type === TransactionType.EXPENSE) : [];

    const expensesAndBudgetsByMonth = (expenses: TransactionProps[], budgets: BudgetProps[]) => {
        const months_num = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const expenseTransactions = expenses.filter(expense => expense.type === TransactionType.EXPENSE);

        const expensesAndBudgetsByMonthArray = months_num.map((month) => {
            const expenseTotalByMonth = expenseTransactions
                .filter((t) => {
                    if (!t.date) return false;

                    const transactionMonth = new Date(t.date.toString()).getMonth() + 1;
                    return transactionMonth === month;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            const budgetTotalByMonth = budgets
                .filter((t) => {
                    const budgetMonth = t.month;
                    return budgetMonth === month;
                })
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: month,
                expensePerMonth: expenseTotalByMonth,
                budgetPerMonth: budgetTotalByMonth,
            };
        });

        return expensesAndBudgetsByMonthArray;
    }

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
                    queryClient.invalidateQueries({ queryKey: ['budgets', budgets] });
                    refetch();
                }}>
                    <ButtonText>Try again</ButtonText>
                </Button>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Bar Chart */}
            <View style={[styles.centered, {
                height: "40%",
                paddingVertical: 10,
            }]}>
                <View style={{
                    width: '95%',
                    height: "100%",
                }}>
                    {expenses ? <VStack
                        style={{
                            flex: 1,
                        }}
                    >
                        <CartesianChart data={
                            expensesAndBudgetsByMonth(expenses as TransactionProps[], budgets as BudgetProps[])
                        }
                            xKey="month"
                            xAxis={{
                                font,
                                tickCount: 12,
                                formatXLabel: (value) => {
                                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                    return monthNames[(value - 1) % 12];
                                },
                            }}
                            yKeys={["expensePerMonth", "budgetPerMonth"]}
                            axisOptions={{
                                font,
                                lineColor: "#d4d4d8",
                            }}
                            domainPadding={{ left: 20, right: 20, top: 30 }}
                        >
                            {({ points, chartBounds }) => (
                                // Bar Group
                                <BarGroup
                                    chartBounds={chartBounds}
                                    betweenGroupPadding={0.3}
                                    withinGroupPadding={0.1}
                                >
                                    <BarGroup.Bar points={points.expensePerMonth} color={TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]} />
                                    <BarGroup.Bar points={points.budgetPerMonth} color={BUDGET_COLOR} />
                                </BarGroup>
                            )}
                        </CartesianChart>
                        {/* Legends */}
                        <HStack className='justify-center items-center'>
                            <Box
                                className="w-5 h-5 rounded"
                                style={{
                                    backgroundColor: TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE],
                                }}
                            />
                            <Text style={[styles.text, {
                                marginHorizontal: 5
                            }]}>Expense</Text>
                            <Box
                                className="w-5 h-5 rounded"
                                style={{
                                    backgroundColor: BUDGET_COLOR,
                                }}
                            />
                            <Text style={[styles.text, {
                                marginHorizontal: 5
                            }]}>Budget</Text>
                        </HStack>
                    </VStack>
                        : <View style={[styles.centeredFlex]}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>No budget data available.</Text>
                        </View>}
                </View>
            </View>

            <ScrollView>
                <View style={{
                    margin: 10,
                }}>
                    {budgets && EXPENSE_CATEGORIES.map((category) => {
                        const expense = (expenses as TransactionProps[]).find(transaction => transaction.category === category);
                        const budget = (budgets as BudgetProps[]).find(budget => budget.category === category);
                        const progress = (expense?.amount || 0) / (budget?.amount || 1) * 100; // Calculate progress as a percentage

                        return (
                            <TouchableOpacity
                                key={category}
                                onLongPress={() => {
                                    setBudgetModalVisible(true);
                                    if (budget) {
                                        formik.setValues({
                                            year: budget.year.toString(),
                                            month: [
                                                'January', 'February', 'March', 'April', 'May', 'June',
                                                'July', 'August', 'September', 'October', 'November', 'December'
                                            ][budget.month - 1],
                                            category: budget.category,
                                            amount: budget.amount.toString(),
                                        });
                                    } else {
                                        formik.setFieldValue('category', category);
                                    }
                                }}
                            >
                                <View key={category} style={{ marginVertical: 5, }}>
                                    <HStack key={category} className='flex-1 justify-between max-w-80 w-full'>
                                        <Heading>{category}</Heading>
                                        <Heading style={{
                                            color: progress > 100 ? "red" : "black",
                                        }}>({progress.toFixed(1)}%)</Heading>
                                    </HStack>
                                    <HStack className='justify-between items-start gap-2'>
                                        <Progress.Bar
                                            progress={progress / 100}
                                            width={280}
                                            height={20}
                                            borderRadius={10}
                                            color={progress > 100 ? "red" : TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]}
                                            borderColor={BUDGET_COLOR}
                                        />
                                        <View style={styles.centeredFlex}>
                                            <Text style={[styles.text, {
                                                color: progress > 100 ? "red" : "black",
                                                marginLeft: 5,
                                            }]}>
                                                {Math.ceil(expense?.amount || 0)}/{budget?.amount || 0}
                                            </Text>
                                        </View>
                                    </HStack>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Budget Modal */}
            {budgetModalVisible && (
                <Modal
                    isOpen={budgetModalVisible}
                    onClose={() => {
                        formik.resetForm();
                        setBudgetModalVisible(false);
                    }}
                    size="md"
                >
                    <ModalBackdrop />
                    <ModalContent>
                        <ModalHeader>
                            <Heading>Enter Budget</Heading>
                        </ModalHeader>
                        <ModalBody>
                            {/* Year */}
                            <FormGroup
                                label='Year'
                                isInvalid={formik.errors.year && formik.touched.year}
                                isRequired={true}
                                errorText={formik.errors.year}
                            >
                                <Select
                                    selectedValue={formik.values.year}
                                    onValueChange={formik.handleChange('year')}
                                >
                                    <SelectTrigger variant="outline" size="md">
                                        <SelectInput placeholder="Select option" className='flex-1' />
                                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            <SelectScrollView
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {(['2024', '2025']).map(
                                                    (label) => (
                                                        <SelectItem
                                                            key={label}
                                                            label={label}
                                                            value={label}
                                                        />
                                                    )
                                                )}
                                            </SelectScrollView>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormGroup>

                            {/* Month */}
                            <FormGroup
                                label='Month'
                                isInvalid={formik.errors.month && formik.touched.month}
                                isRequired={true}
                                errorText={formik.errors.month}
                            >
                                <Select
                                    initialLabel={formik.values.month ? [
                                        'January', 'February', 'March', 'April', 'May', 'June',
                                        'July', 'August', 'September', 'October', 'November', 'December'
                                    ][Number(formik.values.month) - 1] : ''}
                                    selectedValue={formik.values.month}
                                    onValueChange={formik.handleChange('month')}
                                >
                                    <SelectTrigger variant="outline" size="md">
                                        <SelectInput placeholder="Select option" className='flex-1' />
                                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            <SelectScrollView
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {([['January', 1], ['February', 2], ['March', 3], ['April', 4], ['May', 5], ['June', 6], ['July', 7], ['August', 8], ['September', 9], ['October', 10], ['November', 11], ['December', 12]]).map(
                                                    (label) => (
                                                        <SelectItem
                                                            key={label[1]}
                                                            label={label[0].toString()}
                                                            value={label[1].toString()}
                                                        />
                                                    )
                                                )}
                                            </SelectScrollView>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormGroup>

                            {/* Category */}
                            <FormGroup
                                label='Category'
                                isInvalid={formik.errors.category && formik.touched.category}
                                isRequired={true}
                                errorText={formik.errors.category}
                            >
                                <Select
                                    initialLabel={formik.values.category ? formik.values.category[0].toUpperCase() + formik.values.category.slice(1) : ''}
                                    selectedValue={formik.values.category}
                                    onValueChange={formik.handleChange('category')}
                                >
                                    <SelectTrigger variant="outline" size="md">
                                        <SelectInput placeholder="Select option" className='flex-1' />
                                        <SelectIcon className="mr-3" as={ChevronDownIcon} />
                                    </SelectTrigger>
                                    <SelectPortal>
                                        <SelectBackdrop />
                                        <SelectContent>
                                            <SelectDragIndicatorWrapper>
                                                <SelectDragIndicator />
                                            </SelectDragIndicatorWrapper>
                                            <SelectScrollView
                                                showsVerticalScrollIndicator={true}
                                            >
                                                {EXPENSE_CATEGORIES.map(
                                                    (label) => (
                                                        <SelectItem
                                                            key={label}
                                                            label={label[0].toUpperCase() + label.slice(1)}
                                                            value={label}
                                                        />
                                                    )
                                                )}
                                            </SelectScrollView>
                                        </SelectContent>
                                    </SelectPortal>
                                </Select>
                            </FormGroup>

                            {/* Amount */}
                            <FormGroup
                                label='Amount'
                                isInvalid={formik.errors.amount && formik.touched.amount}
                                isRequired={true}
                                errorText={formik.errors.amount}
                            >
                                <Input
                                >
                                    <InputField
                                        type="text"
                                        value={formik.values.amount}
                                        onChangeText={formik.handleChange('amount')}
                                        inputMode='numeric'
                                    />
                                </Input>
                            </FormGroup>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="outline"
                                action="secondary"
                                onPress={() => {
                                    formik.resetForm();
                                    setBudgetModalVisible(false);
                                }}
                            >
                                <ButtonText>Cancel</ButtonText>
                            </Button>
                            <Button
                                onPress={async () => {
                                    formik.handleSubmit();
                                    if (!formik.errors) {
                                        setBudgetModalVisible(false);
                                        queryClient.invalidateQueries({ queryKey: ['budgets'] });      // Invalidate budgets query
                                        refetch();
                                    }
                                }}
                            >
                                <ButtonText>Save</ButtonText>
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default BudgetScreen;
