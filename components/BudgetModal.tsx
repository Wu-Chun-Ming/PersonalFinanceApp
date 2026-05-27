import { FormikValues } from 'formik';

import { Button, ButtonText } from './ui/button';
import { Heading } from './ui/heading';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from './ui/modal';
import { SelectItem } from './ui/select';

import { MONTH_OPTIONS } from '@/constants/time';
import { getMonthName } from '@/utils/time';
import AmountInput from './AmountInput';
import FormGroup from './FormGroup';
import SelectGroup from './SelectGroup';

type BudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  formik: FormikValues;
  selectedYear: number;
  selectedMonth: number;
  expenseCategories: string[];
};

const BudgetModal = ({
  isOpen,
  onClose,
  formik,
  selectedYear,
  selectedMonth,
  expenseCategories,
}: BudgetModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size='md'
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
            isInvalid={Boolean(formik.errors.year && formik.touched.year)}
            isRequired
            errorText={formik.errors.year}
          >
            <SelectGroup
              selectedValue={formik.values.year}
              onValueChange={formik.handleChange('year')}
            >
              {Array.from({ length: 7 }, (_, i) =>
                String(selectedYear - 3 + i),
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
            label='Month'
            isInvalid={Boolean(formik.errors.month && formik.touched.month)}
            isRequired
            errorText={formik.errors.month}
          >
            <SelectGroup
              initialLabel={getMonthName(selectedMonth)}
              selectedValue={formik.values.month}
              onValueChange={formik.handleChange('month')}
            >
              {MONTH_OPTIONS.map(({ label, value }) => (
                <SelectItem
                  key={value}
                  label={label}
                  value={value.toString()}
                />
              ))}
            </SelectGroup>
          </FormGroup>

          {/* Category */}
          <FormGroup
            label='Category'
            isInvalid={Boolean(
              formik.errors.category && formik.touched.category,
            )}
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
            label='Amount'
            isInvalid={Boolean(formik.errors.amount && formik.touched.amount)}
            isRequired
            errorText={formik.errors.amount}
          >
            <AmountInput
              value={formik.values.amount}
              onChangeText={formik.handleChange('amount')}
              showCalculator={true}
            />
          </FormGroup>
        </ModalBody>

        {/* Button Group */}
        <ModalFooter>
          <Button
            variant='outline'
            action='secondary'
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
