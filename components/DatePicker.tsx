import { DatePickerModal } from 'react-native-paper-dates';
import { FormikValues, getIn } from 'formik';

interface DateModalProps {
  visible?: boolean;
  fieldName: string;
  formik: FormikValues;
  mode: 'single' | 'multiple';
  minimumDate?: Date;
  onClose?: () => void;
}

const DatePicker = ({
  visible = true,
  fieldName,
  formik,
  mode,
  minimumDate,
  onClose,
}: DateModalProps) => {
  if (!visible) return null;

  const fieldValue: string | string[] = getIn(formik.values, fieldName);
  const today = new Date();
  const dates = Array.isArray(fieldValue)
    ? fieldValue.map((d: string) => new Date(d))
    : [today];

  if (mode === 'multiple') {
    return (
      <DatePickerModal
        locale='en'
        mode='multiple'
        visible={visible}
        dates={dates}
        onDismiss={() => onClose?.()}
        onConfirm={({ dates }) => {
          formik.setFieldValue(
            fieldName,
            dates.map((d) => d.toString()),
          );
        }}
        validRange={{
          startDate: minimumDate,
        }}
      />
    );
  }

  return (
    <DatePickerModal
      locale='en'
      mode='single'
      visible={visible}
      date={
        !Array.isArray(fieldValue) && fieldValue ? new Date(fieldValue) : today
      }
      onDismiss={() => onClose?.()}
      onConfirm={({ date }) => {
        formik.setFieldValue(fieldName, date?.toString());
      }}
      validRange={{
        startDate: minimumDate,
      }}
    />
  );
};

export default DatePicker;
