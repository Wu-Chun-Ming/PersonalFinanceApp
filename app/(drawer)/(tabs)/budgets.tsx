import { AntDesign } from '@expo/vector-icons';
import { useFont } from '@shopify/react-native-skia';
import { useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { BarGroup, CartesianChart } from 'victory-native';
import * as Yup from 'yup';

// Gluestack UI
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "@/components/ui/modal";
import { SelectItem } from "@/components/ui/select";
import { VStack } from '@/components/ui/vstack';

// Custom import
import styles from '@/app/styles';
import inter from "@/assets/inter-medium.ttf";
import FormGroup from '@/components/FormGroup';
import QueryState from '@/components/QueryState';
import SelectGroup from '@/components/SelectGroup';
import { BUDGET_COLOR, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { BudgetProps, EXPENSE_CATEGORIES, TransactionCategory, TransactionProps, TransactionType } from '@/constants/Types';
import { useBudgets, useUpdateBudget } from '@/hooks/useBudgets';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import useShowToast from '@/hooks/useShowToast';
import { useTransactions } from '@/hooks/useTransactions';

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
    } = useBudgets();
    const {
        data: transactions = [],
        isLoading: isTransactionsLoading,
        isError: isTransactionsError,
    } = useTransactions();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const selectedYearExpenseTransactions = useFilteredTransactions(transactions ?? [], {
        type: TransactionType.EXPENSE,
        recurring: false,
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear, 11, 31),
    });
    const selectedMonthExpenseTransactions = useFilteredTransactions(transactions ?? [], {
        type: TransactionType.EXPENSE,
        recurring: false,
        startDate: new Date(selectedYear, selectedMonth - 1, 1),
        endDate: new Date(selectedYear, selectedMonth, 0),
    });
    const selectedYearBudgets = (budgets ?? [])?.filter(budget => budget.year === selectedYear);
    const selectedMonthBudgets = (budgets ?? [])?.filter(budget => budget.year === selectedYear && budget.month === selectedMonth);
    const [budgetModalVisible, setBudgetModalVisible] = useState(false);

    const updateMutation = useUpdateBudget();

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
            setBudgetModalVisible(false);
        }
    });

    // Calculate total expenses and budgets per month for the selected year
    const expensesAndBudgetsByMonth = (selectedYearExpenseTransactions: TransactionProps[], selectedYearBudgets: BudgetProps[]) => {
        const months_num = Array.from({ length: 12 }, (_, i) => i + 1);

        const expenseTotalByMonth = selectedYearExpenseTransactions.reduce<Record<number, number>>((acc, t) => {
            const month = new Date(t.date).getMonth() + 1;
            acc[month] = (acc[month] || 0) + t.amount;      // Add transaction amount to the respective month
            return acc;
        }, {});

        const budgetTotalByMonth = selectedYearBudgets.reduce<Record<number, number>>((acc, t) => {
            const month = t.month;
            acc[month] = (acc[month] || 0) + t.amount;      // Add budget amount to the respective month
            return acc;
        }, {});

        const expensesAndBudgetsByMonth = months_num.map((month) => ({
            month: month,
            expensePerMonth: expenseTotalByMonth[month] || 0,
            budgetPerMonth: budgetTotalByMonth[month] || 0,
        }));

        return expensesAndBudgetsByMonth;
    }

    const queryState = (
        <QueryState
            isLoading={isLoading}
            isError={isError}
            isRefetching={isRefetching}
            isRefetchError={isRefetchError}
            queryKey='budgets'
            onRetry={refetch}
        />
    );

    if (isLoading || isRefetching || isError || isRefetchError) return queryState;

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Bar Chart */}
            <View style={[styles.centered, {
                height: "40%",
            }]}>
                <View style={{
                    width: '95%',
                    height: "100%",
                }}>
                    <HStack className="justify-center items-center m-2">
                        <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
                            <AntDesign name="leftcircle" size={24} color='black' style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                            Year {selectedYear}
                        </Text>

                        <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
                            <AntDesign name="rightcircle" size={24} color='black' style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>
                    </HStack>

                    {(selectedYearExpenseTransactions.length > 0 || selectedYearBudgets.length > 0) ? <VStack
                        style={{
                            flex: 1,
                        }}
                    >
                        <CartesianChart data={
                            expensesAndBudgetsByMonth(selectedYearExpenseTransactions, selectedYearBudgets)
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

            <View style={styles.centered}>
                <View style={{
                    backgroundColor: BUDGET_COLOR,
                    borderRadius: 20,
                    margin: 10,
                    width: '60%',
                }}>
                    <HStack className="justify-between items-center m-2">
                        <TouchableOpacity
                            disabled={selectedMonth <= 1}
                            onPress={() => setSelectedMonth(selectedMonth - 1)}
                        >
                            <AntDesign name="leftcircle" size={24} color={selectedMonth <= 1 ? 'gray' : 'white'} style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>

                        <Text style={{ fontSize: 18, fontWeight: "bold", color: 'white' }}>
                            {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long' })}
                        </Text>

                        <TouchableOpacity
                            disabled={selectedMonth >= 12}
                            onPress={() => setSelectedMonth(selectedMonth + 1)}
                        >
                            <AntDesign name="rightcircle" size={24} color={selectedMonth >= 12 ? 'gray' : 'white'} style={{ paddingHorizontal: 10 }} />
                        </TouchableOpacity>
                    </HStack>
                </View>
            </View>

            <ScrollView>
                <View style={{
                    margin: 10,
                }}>
                    {budgets && EXPENSE_CATEGORIES.map((category) => {
                        const expenseTotal = selectedMonthExpenseTransactions
                            .filter(transaction => transaction.category === category)
                            .reduce((sum, transaction) => sum + transaction.amount, 0);
                        const budget = selectedMonthBudgets.find(budget => budget.category === category);
                        const progress = (expenseTotal) / (budget?.amount || 1) * 100; // Calculate progress as a percentage

                        return (
                            <TouchableOpacity
                                key={category}
                                onPress={() => {
                                    setBudgetModalVisible(true);
                                    if (budget) {
                                        formik.setValues({
                                            year: budget.year.toString(),
                                            month: budget.month.toString(),
                                            category: budget.category,
                                            amount: (budget.amount || 0).toString(),
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
                                                {Math.ceil(expenseTotal)}/{budget?.amount || 0}
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
                                <SelectGroup
                                    selectedValue={selectedYear.toString() || formik.values.year}
                                    onValueChange={formik.handleChange('year')}
                                >
                                    {(Array.from({ length: 7 }, (_, i) => String(selectedYear - 3 + i))).map(
                                        (label) => (
                                            <SelectItem
                                                key={label}
                                                label={label}
                                                value={label}
                                            />
                                        )
                                    )}
                                </SelectGroup>
                            </FormGroup>

                            {/* Month */}
                            <FormGroup
                                label='Month'
                                isInvalid={formik.errors.month && formik.touched.month}
                                isRequired={true}
                                errorText={formik.errors.month}
                            >
                                <SelectGroup
                                    initialLabel={(selectedMonth || formik.values.month) ? ['January', 'February', 'March', 'April', 'May', 'June',
                                        'July', 'August', 'September', 'October', 'November', 'December'
                                    ][Number(selectedMonth || formik.values.month) - 1] : ''}
                                    selectedValue={selectedMonth.toString() || formik.values.month}
                                    onValueChange={formik.handleChange('month')}
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
                                </SelectGroup>
                            </FormGroup>

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
                                    {EXPENSE_CATEGORIES.map(
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
