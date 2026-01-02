import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader
} from "@/components/ui/modal";
import { FormikValues } from 'formik';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';
import { Button, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import { Input, InputField } from './ui/input';
import { SelectItem } from './ui/select';

type BudgetModalProps = {
    isOpen: boolean;
    onClose: () => void;
    formik: FormikValues;
    selectedYear: number;
    selectedMonth: number;
    expenseCategories: string[];
};

const MONTHS: readonly [string, number][] = [
    ['January', 1],
    ['February', 2],
    ['March', 3],
    ['April', 4],
    ['May', 5],
    ['June', 6],
    ['July', 7],
    ['August', 8],
    ['September', 9],
    ['October', 10],
    ['November', 11],
    ['December', 12],
];

const BudgetModal = ({
    isOpen,
    onClose,
    formik,
    selectedYear,
    selectedMonth,
    expenseCategories,
}: BudgetModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalBackdrop />
            <ModalContent>
                <ModalHeader>
                    <Heading>Enter Budget</Heading>
                </ModalHeader>

                <ModalBody>
                    {/* Year */}
                    <FormGroup
                        label="Year"
                        isInvalid={formik.errors.year && formik.touched.year}
                        isRequired
                        errorText={formik.errors.year}
                    >
                        <SelectGroup
                            selectedValue={formik.values.year}
                            onValueChange={formik.handleChange('year')}
                        >
                            {Array.from({ length: 7 }, (_, i) =>
                                String(selectedYear - 3 + i)
                            ).map((year) => (
                                <SelectItem
                                    key={year}
                                    label={year}
                                    value={year}
                                />
                            ))}
                        </SelectGroup>
                    </FormGroup>

                    {/* Month */}
                    <FormGroup
                        label="Month"
                        isInvalid={formik.errors.month && formik.touched.month}
                        isRequired
                        errorText={formik.errors.month}
                    >
                        <SelectGroup
                            initialLabel={
                                MONTHS[selectedMonth - 1]?.[0] ?? ''
                            }
                            selectedValue={formik.values.month}
                            onValueChange={formik.handleChange('month')}
                        >
                            {MONTHS.map(([name, value]) => (
                                <SelectItem
                                    key={value}
                                    label={name}
                                    value={value.toString()}
                                />
                            ))}
                        </SelectGroup>
                    </FormGroup>

                    {/* Category */}
                    <FormGroup
                        label="Category"
                        isInvalid={formik.errors.category && formik.touched.category}
                        isRequired
                        errorText={formik.errors.category}
                    >
                        <SelectGroup
                            selectedValue={formik.values.category}
                            onValueChange={formik.handleChange('category')}
                        >
                            {expenseCategories.map((category) => (
                                <SelectItem
                                    key={category}
                                    label={category[0].toUpperCase() + category.slice(1)}
                                    value={category}
                                />
                            ))}
                        </SelectGroup>
                    </FormGroup>

                    {/* Amount */}
                    <FormGroup
                        label="Amount"
                        isInvalid={formik.errors.amount && formik.touched.amount}
                        isRequired
                        errorText={formik.errors.amount}
                    >
                        <Input>
                            <InputField
                                type="text"
                                inputMode="numeric"
                                value={formik.values.amount}
                                onChangeText={formik.handleChange('amount')}
                            />
                        </Input>
                    </FormGroup>
                </ModalBody>

                {/* Button Group */}
                <ModalFooter>
                    <Button
                        variant="outline"
                        action="secondary"
                        onPress={onClose}
                    >
                        <ButtonText>Cancel</ButtonText>
                    </Button>

                    <Button onPress={formik.handleSubmit}>
                        <ButtonText>Save</ButtonText>
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default BudgetModal;