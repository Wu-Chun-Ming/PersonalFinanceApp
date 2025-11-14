import { AntDesign } from '@expo/vector-icons';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

// Gluestack UI
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
import BarChart from '@/components/BarChart';
import FormGroup from '@/components/FormGroup';
import QueryState from '@/components/QueryState';
import SelectGroup from '@/components/SelectGroup';
import YearSelector from '@/components/YearSelector';
import { BUDGET_COLOR, TRANSACTION_TYPE_COLORS } from '@/constants/Colors';
import { EXPENSE_CATEGORIES, TransactionType } from '@/constants/Types';
import { useBudgetData, useBudgets } from '@/hooks/useBudgets';
import { useBudgetFormik } from '@/hooks/useBudgetsFormik';
import { useTransactionData } from '@/hooks/useTransactions';

const BudgetScreen = () => {
    const {
        data: budgets = [],
        isLoading,
        isError,
        isRefetchError,
        isRefetching,
        refetch
    } = useBudgets();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const {
        selectedYearExpenseTransactions,
        selectedMonthExpenseTransactions,
    } = useTransactionData(selectedYear, selectedMonth);
    const {
        selectedYearBudgets,
        expenseTotalsByCategory,
        budgetByCategory,
        expensesAndBudgetsByMonth,
    } = useBudgetData(budgets, selectedYearExpenseTransactions, selectedMonthExpenseTransactions, selectedYear, selectedMonth);

    // Formik setup
    const {
        budgetFormik: formik,
        budgetModalVisible,
        setBudgetModalVisible,
    } = useBudgetFormik();

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
                    <YearSelector
                        onYearChange={(year) => setSelectedYear(year)}
                    />
                    {(
                        (selectedYearExpenseTransactions && selectedYearExpenseTransactions.length > 0)
                        || (selectedYearBudgets && selectedYearBudgets.length > 0)
                    ) ? <VStack
                        style={{
                            flex: 1,
                        }}
                    >
                        <BarChart
                            data={expensesAndBudgetsByMonth}
                            xKey="month"
                            yKeys={[
                                ["expensePerMonth", TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ["budgetPerMonth", BUDGET_COLOR],
                            ]}
                            legends={[
                                ["Expense", TRANSACTION_TYPE_COLORS[TransactionType.EXPENSE]],
                                ["Budget", BUDGET_COLOR],
                            ]}
                        />
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
                    {EXPENSE_CATEGORIES.map((category) => {
                        const expenseTotal = expenseTotalsByCategory[category] || 0;
                        const budget = budgetByCategory[category];
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
                                onPress={() => formik.handleSubmit()}
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
