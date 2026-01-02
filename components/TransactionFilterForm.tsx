import dayjs from "dayjs";
import { FormikProps } from "formik";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity } from "react-native";
import Collapsible from "react-native-collapsible";
import { Dropdown } from "react-native-element-dropdown";

// Gluestack UI
import { Button } from "./ui/button";
import { HStack } from "./ui/hstack";
import { VStack } from "./ui/vstack";

// Custom import
import styles from "@/app/styles";
import {
    RECURRING_FREQUENCIES,
    TRANSACTION_CATEGORIES,
    TRANSACTION_TYPES,
} from "@/constants/transaction";
import DatePicker from "./DatePicker";

interface FilterValues {
    date: string;
    type: string;
    category: string;
    amount: string;
    recurring: string;
    frequency: string;
}

interface TransactionFilterFormProps {
    isCollapsed: boolean;
    formik: FormikProps<FilterValues>;
}

const TransactionFilterForm = ({
    isCollapsed,
    formik,
}: TransactionFilterFormProps) => {
    const [dateModalVisible, setDateModalVisible] = useState<boolean>(false);

    return (
        <>
            <Collapsible collapsed={isCollapsed}>
                <VStack
                    style={{
                        backgroundColor: '#fff',
                    }}
                >
                    {/* Date & Type */}
                    <HStack style={{
                        margin: 5,
                    }}>
                        {/* Date */}
                        <HStack style={[{
                            width: '45%',
                            alignItems: 'center',
                            marginRight: '5%',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text style={[styles.boldText, {
                                marginRight: 10,
                            }]}>Date:</Text>
                            <TouchableOpacity
                                onPress={() => setDateModalVisible(true)}
                                style={styles.centeredFlex}
                            >
                                <Text style={[styles.text]}>
                                    {formik.values.date ? dayjs(formik.values.date).format('YYYY-MM-DD') : 'Select date'}
                                </Text>
                            </TouchableOpacity>
                        </HStack>

                        {/* Type */}
                        <HStack style={[{
                            width: '50%',
                            alignItems: 'center',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text style={[styles.boldText, {
                                marginRight: 10,
                            }]}>Type:</Text>
                            <Dropdown
                                data={[
                                    { label: 'All', value: '' },
                                    ...TRANSACTION_TYPES.map((type) => ({
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
                        <Text style={[styles.boldText, {
                            marginRight: 10,
                        }]}>Category:</Text>
                        <Dropdown
                            data={[
                                { label: '-', value: '' },
                                ...TRANSACTION_CATEGORIES.map((category) => ({
                                    label: category.charAt(0).toUpperCase() + category.slice(1),
                                    value: category,
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
                        <Text style={[styles.boldText, {
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
                        {/* Recurring */}
                        <HStack style={[{
                            width: '45%',
                            marginRight: 10,
                            alignItems: 'center',
                            padding: 10,
                            backgroundColor: '#d8e0e6ff',
                            borderRadius: 10,
                        }]}>
                            <Text
                                style={[styles.boldText, {
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

                        {/* Frequency */}
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
                                style={[styles.boldText, {
                                    marginRight: 10,
                                }]}
                            >Frequency:</Text>
                            <Dropdown
                                data={[
                                    { label: '-', value: '' },
                                    ...RECURRING_FREQUENCIES.map((frequency) => ({
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
                        <Text style={[styles.boldText, {
                            color: 'white',
                        }]}>Reset Filters</Text>
                    </Button>}
                </VStack>
            </Collapsible>

            {/* Date Picker Modal */}
            <DatePicker
                visible={dateModalVisible}
                fieldName="date"
                formik={formik}
                onClose={() => setDateModalVisible(false)}
            />
        </>
    );
};

export default TransactionFilterForm;